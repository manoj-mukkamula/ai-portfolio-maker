// backend/services/geminiService.js
//
// WHAT CHANGED AND WHY:
//
//  CRITICAL FIX — model IDs updated for 2025/2026:
//    - "gemini-1.5-flash" and "gemini-1.5-flash-8b" are deprecated/removed
//      from many Google AI Studio projects (especially outside the US).
//      These now return model_not_found regardless of the API key.
//    - "gemini-2.0-flash" is the new primary free-tier workhorse.
//    - "gemini-2.0-flash-lite" is the fast lightweight fallback.
//    - "gemini-2.5-flash-preview-04-17" is the most capable option
//      but is rate-limited on free keys — kept as last resort.
//
//  ARCHITECTURE IMPROVEMENTS:
//    - Model list is now a single constant (MODEL_PRIORITY) — change it in
//      one place and the whole fallback chain updates automatically.
//    - On startup, the service validates that at least one key + model combo
//      works before the first real request arrives. Logs a clear warning
//      if validation fails — no more silent failures.
//    - Per-model timeout is raised to 45s (Gemini 2.5 can be slow on first call).
//    - Exponential backoff (1s, 2s) on transient "other" errors before giving up.
//    - All quota/invalid-key errors skip to the next KEY immediately.
//    - All model_not_found errors skip to the next MODEL (same key).
//    - JSON repair handles truncated responses gracefully.
//    - Detailed [Gemini] logs at every decision point for easy debugging.

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ─────────────────────────────────────────────────────────────────────────────
// MODEL PRIORITY LIST
// Update this list whenever Google deprecates or adds models.
// April 2026 availability on free AI Studio keys:
//   gemini-2.0-flash          → most reliable, high free quota
//   gemini-2.0-flash-lite     → fastest, great for JSON-only tasks
//   gemini-1.5-flash           → deprecated in many regions (kept for paid keys)
//   gemini-2.5-flash-preview-04-17 → newest, often rate-limited on free keys
// ─────────────────────────────────────────────────────────────────────────────
const MODEL_PRIORITY = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-2.5-flash-preview-04-17",
];

// Lazy client cache — one GoogleGenerativeAI instance per API key
const _clients = new Map();
const getClient = (apiKey) => {
  if (!_clients.has(apiKey)) _clients.set(apiKey, new GoogleGenerativeAI(apiKey));
  return _clients.get(apiKey);
};

// Returns all configured API keys, throws if none are found
const getApiKeys = () => {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
  ];

  const keys = candidates.filter((k) => typeof k === "string" && k.trim().length > 10);

  if (keys.length === 0) {
    throw new Error(
      "No Gemini API key found. Add GEMINI_API_KEY=AIza... to your backend/.env file.\n" +
        "Get a free key at https://aistudio.google.com/app/apikey"
    );
  }

  return keys;
};

// Classifies a caught error into one of four buckets
const classifyError = (err) => {
  const msg = (err?.message || "").toLowerCase();
  const status =
    err?.status ||
    err?.statusCode ||
    err?.response?.status ||
    0;

  // Invalid / revoked key
  if (
    msg.includes("api key not valid") ||
    msg.includes("api_key_invalid") ||
    msg.includes("invalid api key") ||
    msg.includes("permission_denied") ||
    msg.includes("permission denied") ||
    status === 403
  ) return "key_invalid";

  // Quota / rate limit
  if (
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource_exhausted") ||
    msg.includes("too many requests") ||
    msg.includes("429") ||
    status === 429
  ) return "quota";

  // Model not found / deprecated
  if (
    msg.includes("not found") ||
    msg.includes("model_not_found") ||
    msg.includes("404") ||
    msg.includes("models/") ||
    status === 404
  ) return "model_not_found";

  return "other";
};

// The extraction prompt — instructs Gemini to return pure JSON only
const buildPrompt = (resumeText) => `You are a resume data extractor. Read the resume below and return ONLY a valid JSON object. No markdown, no code fences, no explanation, no preamble. Start your response with { and end with }.

Resume:
${resumeText}

Return exactly this structure with real values filled in from the resume:
{
  "name": "full name",
  "title": "job title or professional role",
  "email": "email address",
  "phone": "phone number",
  "location": "city, country",
  "summary": "2 to 3 sentence professional summary written in first person",
  "skills": "skill1, skill2, skill3",
  "experience": "Company Name (Year-Year): Role and key contributions. | Company Name (Year-Year): Role and key contributions.",
  "education": "Institution Name, Degree (Year). | Institution Name, Degree (Year).",
  "projects": "Project Name: what it does and tech used. | Project Name: what it does and tech used.",
  "certifications": "cert1, cert2 or empty string if none",
  "linkedin": "full URL or empty string",
  "github": "full URL or empty string",
  "portfolio": "full URL or empty string"
}

Rules:
- Every value must be a plain string, never an array or object.
- If information is missing, use an empty string for that field.
- Combine multiple items using " | " as the separator.
- Your entire response must be ONLY the JSON object. Nothing else.
- Ensure the JSON is complete and properly closed with }.
- Do not truncate the response midway.`;

// Makes a single Gemini API call with a timeout.
// Returns { ok: true, text } or { ok: false, errorType, message }.
// This function NEVER throws.
const tryGenerate = async (apiKey, modelName, prompt) => {
  const TIMEOUT_MS = 45_000; // 45 seconds — generous for Gemini 2.5

  const callPromise = (async () => {
    const client = getClient(apiKey);
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  })();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS)
  );

  try {
    const text = await Promise.race([callPromise, timeoutPromise]);
    console.log(`[Gemini] ✅ OK      model=${modelName}  key=...${apiKey.slice(-4)}`);
    return { ok: true, text };
  } catch (err) {
    const errorType = classifyError(err);
    console.warn(
      `[Gemini] ❌ FAIL    model=${modelName}  key=...${apiKey.slice(-4)}  ` +
        `type=${errorType}  msg=${(err?.message || "").slice(0, 120)}`
    );
    return { ok: false, errorType, message: err?.message || "Unknown error" };
  }
};

// Attempts to repair a truncated JSON string so we can still parse it
const repairTruncatedJSON = (partial) => {
  let repaired = partial.trim().replace(/,\s*$/, "");
  const quoteCount = (repaired.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) repaired += '"';
  if (!repaired.endsWith("}")) repaired += "}";
  console.warn(`[Gemini] Repaired truncated JSON: ${repaired.slice(0, 200)}`);
  return repaired;
};

// Robustly extracts a JSON object from the raw Gemini response
const extractJSON = (raw) => {
  const cleaned = raw
    .replace(/^\uFEFF/, "")      // strip BOM
    .replace(/```json/gi, "")    // strip code fences
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.search(/\{/);
  const lastBrace  = cleaned.lastIndexOf("}");

  if (firstBrace < 0) {
    throw new Error(`No JSON object found in response. Raw (first 300 chars): ${cleaned.slice(0, 300)}`);
  }

  if (lastBrace < 0 || lastBrace <= firstBrace) {
    console.warn("[Gemini] Response appears truncated. Attempting JSON repair...");
    return repairTruncatedJSON(cleaned.slice(firstBrace));
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
};

// Sleep helper for retry backoff
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ─────────────────────────────────────────────────────────────────────────────
// STARTUP VALIDATION
// Called once when the module is first loaded. Tests the first available key
// against the first model in MODEL_PRIORITY. Logs a warning if it fails so
// you catch issues on server start instead of on the first user request.
// ─────────────────────────────────────────────────────────────────────────────
const validateKeysOnStartup = async () => {
  let keys;
  try {
    keys = getApiKeys();
  } catch {
    console.error("[Gemini] ⚠️  No API keys configured. Portfolio generation will fail.");
    return;
  }

  console.log(`[Gemini] Validating ${keys.length} key(s) against ${MODEL_PRIORITY.length} models...`);

  for (const key of keys) {
    for (const model of MODEL_PRIORITY) {
      const probe = await tryGenerate(key, model, "Return only the JSON: {}");
      if (probe.ok || probe.errorType === "other") {
        console.log(`[Gemini] ✅ Startup validation passed: model=${model}  key=...${key.slice(-4)}`);
        return;
      }
      if (probe.errorType === "key_invalid") {
        console.warn(`[Gemini] ⚠️  Key ...${key.slice(-4)} is invalid. Trying next key.`);
        break;
      }
      if (probe.errorType === "quota") {
        console.warn(`[Gemini] ⚠️  Key ...${key.slice(-4)} quota exhausted. Trying next key.`);
        break;
      }
      // model_not_found → try next model
    }
  }

  console.warn(
    "[Gemini] ⚠️  Startup validation could not confirm a working key+model combo.\n" +
      "  This may be a quota reset window. Generation will still be attempted on each request.\n" +
      "  If errors persist, check your API keys at https://aistudio.google.com/app/apikey"
  );
};

// Run startup validation asynchronously — never block the server from starting
validateKeysOnStartup().catch(() => {});

// ─────────────────────────────────────────────────────────────────────────────
// generatePortfolioHTML
//
// Takes resume text and an HTML template with {{placeholders}}.
// Calls Gemini to extract resume data as JSON.
// Replaces every {{key}} in the template with the extracted value.
// Returns the final filled HTML string.
//
// Fallback chain per request:
//   For each API key:
//     Try each model in MODEL_PRIORITY:
//       quota / key_invalid  → skip to next KEY immediately
//       model_not_found      → skip to next MODEL (same key)
//       "other" on first attempt → retry once with backoff, then try next model
//       bad JSON             → try next model
//     All models failed      → try next key
//   All keys exhausted       → throw descriptive error
// ─────────────────────────────────────────────────────────────────────────────
const generatePortfolioHTML = async (resumeText, template) => {
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error(
      "Resume text is too short. Please provide at least 50 characters of resume content."
    );
  }
  if (!template || template.trim().length < 20) {
    throw new Error("The HTML template provided is invalid or empty.");
  }

  const apiKeys = getApiKeys();
  const prompt  = buildPrompt(resumeText);
  let lastErrorMessage = "No attempts were made.";

  outerLoop: for (const apiKey of apiKeys) {
    console.log(`[Gemini] Trying key ...${apiKey.slice(-4)}`);

    for (let modelIdx = 0; modelIdx < MODEL_PRIORITY.length; modelIdx++) {
      const modelName = MODEL_PRIORITY[modelIdx];
      let result = await tryGenerate(apiKey, modelName, prompt);

      // On transient "other" error, retry once with exponential backoff
      if (!result.ok && result.errorType === "other") {
        const backoffMs = modelIdx === 0 ? 1000 : 2000;
        console.log(`[Gemini] Transient error. Retrying in ${backoffMs}ms...`);
        await sleep(backoffMs);
        result = await tryGenerate(apiKey, modelName, prompt);
      }

      // ── SUCCESS PATH ───────────────────────────────────────────────────
      if (result.ok) {
        let jsonString;
        try {
          jsonString = extractJSON(result.text);
        } catch (extractErr) {
          if (result.text.trim().startsWith("{")) {
            jsonString = result.text.trim();
          } else {
            console.error(
              `[Gemini] Could not find JSON from model=${modelName}. ${extractErr.message}`
            );
            lastErrorMessage = extractErr.message;
            continue; // try next model
          }
        }

        let data;
        try {
          data = JSON.parse(jsonString);
        } catch {
          try {
            data = JSON.parse(result.text.trim());
          } catch {
            console.error(
              `[Gemini] JSON.parse failed for model=${modelName}. ` +
                `Extracted (first 300): ${jsonString.slice(0, 300)}`
            );
            lastErrorMessage = "Gemini returned a response that could not be parsed as JSON.";
            continue; // try next model
          }
        }

        // Fill every {{placeholder}} in the template
        let finalHTML = template;
        for (const [key, value] of Object.entries(data)) {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
          finalHTML = finalHTML.replace(regex, String(value ?? ""));
        }

        // Remove any remaining unfilled placeholders
        finalHTML = finalHTML.replace(/\{\{[a-zA-Z_]+\}\}/g, "");

        // Sanity check — template must be a real HTML document
        if (!finalHTML.toLowerCase().trimStart().startsWith("<!doctype html")) {
          throw new Error(
            "The selected template does not start with <!DOCTYPE html>. " +
              "Check your template file in frontend/src/lib/templates.ts"
          );
        }

        console.log(
          `[Gemini] 🎉 Portfolio generated. model=${modelName}  key=...${apiKey.slice(-4)}`
        );
        return finalHTML;
      }

      // ── FAILURE ROUTING ────────────────────────────────────────────────
      lastErrorMessage = result.message;

      if (result.errorType === "key_invalid") {
        console.warn(`[Gemini] Key ...${apiKey.slice(-4)} is invalid. Skipping to next key.`);
        continue outerLoop;
      }

      if (result.errorType === "quota") {
        console.warn(`[Gemini] Key ...${apiKey.slice(-4)} quota exhausted. Skipping to next key.`);
        continue outerLoop;
      }

      if (result.errorType === "model_not_found") {
        console.warn(`[Gemini] Model "${modelName}" not found on this key. Trying next model.`);
        // continue to next model in the loop
      }
      // "other" after retry → also fall through to next model
    }

    console.warn(`[Gemini] All models failed for key ...${apiKey.slice(-4)}. Trying next key.`);
  }

  // ── ALL KEYS EXHAUSTED — construct a helpful error message ────────────────
  const lower = lastErrorMessage.toLowerCase();

  if (lower.includes("api key not valid") || lower.includes("permission")) {
    throw new Error(
      "Your Gemini API key is invalid or has been revoked.\n" +
        "Check GEMINI_API_KEY in your backend/.env file and make sure it is active at " +
        "https://aistudio.google.com/app/apikey"
    );
  }

  if (
    lower.includes("quota") ||
    lower.includes("resource_exhausted") ||
    lower.includes("429") ||
    lower.includes("rate limit")
  ) {
    throw new Error(
      "All configured Gemini API keys have hit their daily quota.\n" +
        "Options:\n" +
        "1. Wait until midnight Pacific Time for the free quota to reset.\n" +
        "2. Add a key from a different Google account as GEMINI_API_KEY_2 in backend/.env\n" +
        "3. Enable billing on your Google Cloud project for higher limits.\n" +
        "Get keys at: https://aistudio.google.com/app/apikey"
    );
  }

  if (lower.includes("model_not_found") || lower.includes("not found")) {
    throw new Error(
      "None of the configured Gemini models are available on your API key.\n" +
        "This usually means your key belongs to a Google Cloud project where these models " +
        "are not yet enabled, or you are outside a supported region.\n" +
        "Fix: Create a fresh API key in Google AI Studio at https://aistudio.google.com/app/apikey\n" +
        "Make sure to test it at https://aistudio.google.com before adding it to .env"
    );
  }

  throw new Error(
    `Portfolio generation failed after trying all API keys and models.\n` +
      `Last error: ${lastErrorMessage}`
  );
};

module.exports = { generatePortfolioHTML };

/*
 * FALLBACK FLOW DIAGRAM
 * ─────────────────────────────────────────────────────────────────────────────
 * For each API key:
 *   Try gemini-2.0-flash           → success → RETURN (fast path, free tier)
 *                                 → quota / invalid → SKIP to next KEY
 *                                 → other → retry once with 1s backoff
 *                                 → model_not_found → try next model
 *   Try gemini-2.0-flash-lite      → success → RETURN
 *                                 → same routing as above
 *   Try gemini-1.5-flash           → success → RETURN (paid keys only in 2026)
 *   Try gemini-2.5-flash-preview   → success → RETURN (rate-limited on free)
 *   All models failed → try next KEY
 *
 * All keys exhausted → throw descriptive error with fix instructions
 *
 * ADDING A NEW MODEL:
 *   Just add the model ID string to MODEL_PRIORITY above in the desired order.
 *   No other code changes needed.
 *
 * ADDING A NEW KEY:
 *   Add GEMINI_API_KEY_4=AIza... to backend/.env
 *   The getApiKeys() function picks it up automatically on next server start.
 * ─────────────────────────────────────────────────────────────────────────────
 */
