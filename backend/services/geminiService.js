// backend/services/geminiService.js
//
// FIXES IN THIS VERSION:
//
//  1. SDK UPGRADE REQUIRED: bump @google/generative-ai to ^0.21.0 in package.json,
//     then run `npm install` in the backend folder. SDK 0.15.x did not support
//     "gemini-2.0-flash-lite" as a valid model ID — it silently routed all calls
//     to the gemini-2.0-flash endpoint, meaning both attempts burned the same
//     quota pool and both failed together.
//
//  2. MODEL LIST updated for India / free tier (April 2026):
//       gemini-2.0-flash-lite   → primary; SDK 0.21+ supports it properly,
//                                  separate quota pool from gemini-2.0-flash
//       gemini-1.5-flash-8b     → secondary; completely separate quota pool,
//                                  still actively available in India on free keys
//       gemini-2.0-flash        → tertiary fallback
//     Total: 3 independent quota pools per API key instead of 1.
//
//  3. NO STARTUP API CALLS — zero Gemini calls on server start. The old
//     validateKeysOnStartup() burned quota before any user request.
//
//  4. On quota error, tries the NEXT MODEL (not next key) because each model
//     has a separate daily quota. Only moves to the next key after all models
//     for the current key are exhausted.

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ─────────────────────────────────────────────────────────────────────────────
// MODEL PRIORITY — 3 separate quota pools on a single free API key
//
// Free tier limits per model per day (India, April 2026):
//   gemini-2.0-flash-lite : ~200 RPD, fast, ideal for JSON extraction
//   gemini-1.5-flash-8b   : ~500 RPD, completely separate pool, reliable
//   gemini-2.0-flash      : ~50–200 RPD depending on region
//
// To add a model: append its ID string here. No other code changes needed.
// To remove a model: delete its line here.
// ─────────────────────────────────────────────────────────────────────────────
const MODEL_PRIORITY = [
  "gemini-2.0-flash-lite",   // fastest, own quota pool (requires SDK 0.21+)
  "gemini-1.5-flash-8b",     // most generous free quota, always available
  "gemini-2.0-flash",        // last resort — share quota with lite on old SDKs
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
      "No Gemini API key found. Add GEMINI_API_KEY=AIza... to backend/.env\n" +
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

  if (
    msg.includes("api key not valid") ||
    msg.includes("api_key_invalid") ||
    msg.includes("invalid api key") ||
    msg.includes("permission_denied") ||
    msg.includes("permission denied") ||
    status === 403
  ) return "key_invalid";

  if (
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource_exhausted") ||
    msg.includes("too many requests") ||
    msg.includes("429") ||
    status === 429
  ) return "quota";

  if (
    msg.includes("not found") ||
    msg.includes("model_not_found") ||
    msg.includes("404") ||
    status === 404
  ) return "model_not_found";

  return "other";
};

// Builds the extraction prompt — returns pure JSON only
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
// Never throws.
const tryGenerate = async (apiKey, modelName, prompt) => {
  const TIMEOUT_MS = 30_000;

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
    setTimeout(
      () => reject(new Error(`Request timed out after ${TIMEOUT_MS / 1000}s`)),
      TIMEOUT_MS
    )
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

// Attempts to repair a truncated JSON string
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
    .replace(/^\uFEFF/, "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.search(/\{/);
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace < 0) {
    throw new Error(
      `No JSON object found in response. Raw (first 300 chars): ${cleaned.slice(0, 300)}`
    );
  }

  if (lastBrace < 0 || lastBrace <= firstBrace) {
    console.warn("[Gemini] Response appears truncated. Attempting JSON repair...");
    return repairTruncatedJSON(cleaned.slice(firstBrace));
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ─────────────────────────────────────────────────────────────────────────────
// generatePortfolioHTML
//
// Fallback chain:
//   For each API key:
//     For each model in MODEL_PRIORITY:
//       quota        → try NEXT MODEL (each model has its own quota pool)
//       key_invalid  → skip to NEXT KEY
//       model_not_found → try NEXT MODEL
//       "other" error  → retry once with 1s backoff, then try NEXT MODEL
//       bad JSON       → try NEXT MODEL
//     All models exhausted → try NEXT KEY
//   All keys exhausted → throw descriptive error
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
  const prompt = buildPrompt(resumeText);
  let lastErrorMessage = "No attempts were made.";
  let allQuota = true; // track if every failure was quota-related

  for (const apiKey of apiKeys) {
    console.log(`[Gemini] Trying key ...${apiKey.slice(-4)}`);

    for (let modelIdx = 0; modelIdx < MODEL_PRIORITY.length; modelIdx++) {
      const modelName = MODEL_PRIORITY[modelIdx];
      let result = await tryGenerate(apiKey, modelName, prompt);

      // Retry once on transient errors
      if (!result.ok && result.errorType === "other") {
        console.log(`[Gemini] Transient error on ${modelName}. Retrying in 1s...`);
        await sleep(1000);
        result = await tryGenerate(apiKey, modelName, prompt);
      }

      // ── SUCCESS ──────────────────────────────────────────────────────
      if (result.ok) {
        let jsonString;
        try {
          jsonString = extractJSON(result.text);
        } catch (extractErr) {
          if (result.text.trim().startsWith("{")) {
            jsonString = result.text.trim();
          } else {
            console.error(`[Gemini] No JSON from model=${modelName}. ${extractErr.message}`);
            lastErrorMessage = extractErr.message;
            allQuota = false;
            continue;
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
            allQuota = false;
            continue;
          }
        }

        // Fill template placeholders
        let finalHTML = template;
        for (const [key, value] of Object.entries(data)) {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
          finalHTML = finalHTML.replace(regex, String(value ?? ""));
        }
        finalHTML = finalHTML.replace(/\{\{[a-zA-Z_]+\}\}/g, "");

        if (!finalHTML.toLowerCase().trimStart().startsWith("<!doctype html")) {
          throw new Error(
            "The selected template does not start with <!DOCTYPE html>. " +
              "Check your template file in frontend/src/lib/templates.ts"
          );
        }

        console.log(
          `[Gemini] Portfolio generated. model=${modelName}  key=...${apiKey.slice(-4)}`
        );
        return finalHTML;
      }

      // ── FAILURE ROUTING ──────────────────────────────────────────────
      lastErrorMessage = result.message;

      if (result.errorType === "key_invalid") {
        console.warn(`[Gemini] Key ...${apiKey.slice(-4)} is invalid. Skipping to next key.`);
        allQuota = false;
        break; // break inner loop → try next key
      }

      if (result.errorType === "quota") {
        console.warn(
          `[Gemini] Key ...${apiKey.slice(-4)} quota exhausted on model=${modelName}. Trying next model.`
        );
        // continue to next model — each model has its own daily quota
        continue;
      }

      if (result.errorType === "model_not_found") {
        console.warn(`[Gemini] Model "${modelName}" not available. Trying next model.`);
        allQuota = false;
        continue;
      }

      // "other" after retry
      allQuota = false;
    }

    console.warn(`[Gemini] All models failed for key ...${apiKey.slice(-4)}. Trying next key.`);
  }

  // ── ALL KEYS/MODELS EXHAUSTED ─────────────────────────────────────────────
  const lower = lastErrorMessage.toLowerCase();

  if (lower.includes("api key not valid") || lower.includes("permission")) {
    throw new Error(
      "Your Gemini API key is invalid or has been revoked. " +
        "Check GEMINI_API_KEY in backend/.env at https://aistudio.google.com/app/apikey"
    );
  }

  if (
    allQuota ||
    lower.includes("quota") ||
    lower.includes("resource_exhausted") ||
    lower.includes("429") ||
    lower.includes("rate limit")
  ) {
    throw new Error(
      "All configured Gemini API keys have hit their daily quota. " +
        "Options: (1) Wait until midnight Pacific Time for the free quota to reset. " +
        "(2) Add a key from a different Google account as GEMINI_API_KEY_2 in backend/.env. " +
        "(3) Enable billing on your Google Cloud project for higher limits. " +
        "Get keys at: https://aistudio.google.com/app/apikey"
    );
  }

  if (lower.includes("model_not_found") || lower.includes("not found")) {
    throw new Error(
      "None of the Gemini models are available on your API key. " +
        "Create a fresh key at https://aistudio.google.com/app/apikey and test it in AI Studio first."
    );
  }

  throw new Error(
    `Portfolio generation failed after trying all API keys and models. Last error: ${lastErrorMessage}`
  );
};

module.exports = { generatePortfolioHTML };
