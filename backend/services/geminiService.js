// backend/services/geminiService.js
//
// KEY FIXES (April 2026):
//
//  1. REMOVED startup validation — the old validateKeysOnStartup() fired 4+ real
//     Gemini API calls every time the server started, burning free-tier quota before
//     a single user request. Startup now does zero Gemini calls.
//
//  2. MODEL PRIORITY reordered — gemini-2.0-flash-lite is now first because:
//       • It has a SEPARATE free quota from gemini-2.0-flash.
//       • It is faster and cheaper for JSON-only extraction tasks.
//       • If lite quota is also exhausted, we fall through to gemini-2.0-flash.
//     This means one API key effectively gets 2x the free daily quota.
//
//  3. gemini-1.5-flash REMOVED from the list — it returns model_not_found in
//     most regions outside the US as of early 2026, which wastes an attempt.
//
//  4. gemini-2.5-flash-preview-04-17 REMOVED — consistently 404 on free keys
//     in India/Asia. Add it back manually if your key supports it.
//
//  5. Per-attempt timeout reduced to 30s (was 45s) — keeps the UX responsive.
//     If you use gemini-2.5 models, raise this back to 45s.

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ─────────────────────────────────────────────────────────────────────────────
// MODEL PRIORITY LIST
// lite first  → separate quota pool on free tier, faster for JSON tasks
// 2.0-flash   → fallback if lite quota is exhausted
// Add "gemini-2.5-flash-preview-04-17" here if your key/region supports it.
// ─────────────────────────────────────────────────────────────────────────────
const MODEL_PRIORITY = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
];

// Lazy client cache — one GoogleGenerativeAI instance per API key
const _clients = new Map();
const getClient = (apiKey) => {
  if (!_clients.has(apiKey)) _clients.set(apiKey, new GoogleGenerativeAI(apiKey));
  return _clients.get(apiKey);
};

// Returns all configured API keys, throws if none found
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
${resumeText.slice(0, 6000)}

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
  const TIMEOUT_MS = 30_000; // 30 seconds

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
// generatePortfolioHTML
//
// Takes resume text and an HTML template with {{placeholders}}.
// Calls Gemini to extract resume data as JSON.
// Replaces every {{key}} in the template with the extracted value.
// Returns the final filled HTML string.
//
// Fallback chain per request:
//   For each API key:
//     Try gemini-2.0-flash-lite    (separate quota pool — tried first)
//     Try gemini-2.0-flash         (fallback if lite quota exhausted)
//     quota / key_invalid → skip to next KEY immediately
//     model_not_found     → skip to next MODEL (same key)
//     "other" on first attempt → retry once with 1s backoff
//     bad JSON            → try next model
//   All models failed     → try next key
//   All keys exhausted    → throw descriptive error
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

      // On transient "other" error, retry once with a short backoff
      if (!result.ok && result.errorType === "other") {
        const backoffMs = 1000;
        console.log(`[Gemini] Transient error on ${modelName}. Retrying in ${backoffMs}ms...`);
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
        console.warn(
          `[Gemini] Key ...${apiKey.slice(-4)} quota exhausted on model=${modelName}. Trying next model.`
        );
        // Do NOT skip to next key on quota — try the next model first.
        // gemini-2.0-flash-lite and gemini-2.0-flash have SEPARATE quota pools.
        // continue to next model in the inner loop
      }

      if (result.errorType === "model_not_found") {
        console.warn(`[Gemini] Model "${modelName}" not found on this key. Trying next model.`);
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
        "This usually means your key is region-restricted or the project has not enabled these models.\n" +
        "Fix: Create a fresh key at https://aistudio.google.com/app/apikey and test it in AI Studio first."
    );
  }

  throw new Error(
    `Portfolio generation failed after trying all API keys and models.\n` +
      `Last error: ${lastErrorMessage}`
  );
};

module.exports = { generatePortfolioHTML };

/*
 * FALLBACK FLOW (per request)
 * ─────────────────────────────────────────────────────────────────────────────
 * For each API key:
 *   Try gemini-2.0-flash-lite   → success → RETURN  (separate quota, tried first)
 *                               → quota   → try next model (NOT next key)
 *                               → invalid → SKIP to next KEY
 *                               → other   → retry once with 1s backoff
 *   Try gemini-2.0-flash        → success → RETURN
 *                               → quota   → all models exhausted for this key
 *   All models quota-exhausted  → try next KEY
 *
 * All keys exhausted → throw descriptive error with fix instructions
 *
 * WHY lite FIRST:
 *   Google's free tier gives separate RPD (requests-per-day) limits per model.
 *   Using lite first means you get ~2x the daily free calls before hitting limits.
 *
 * ADDING A NEW MODEL:
 *   Just add the model ID string to MODEL_PRIORITY above.
 *
 * ADDING A NEW KEY:
 *   Add GEMINI_API_KEY_2=AIza... to backend/.env and restart.
 * ─────────────────────────────────────────────────────────────────────────────
 */
