// backend/services/geminiService.js
//
// ROOT CAUSE OF THE BUG (now fixed):
//   The @google/generative-ai SDK sends a real HTTP request even when the API
//   key is undefined/invalid. Google's server responds with an error whose
//   message contains "API key not valid" — which does NOT contain "quota" or
//   "limit". The old catch block only checked for "quota" and "limit", so it
//   fell through with a raw unhandled error.
//
//   Additionally: even with a valid key, the free-tier RPD (requests per day)
//   limit can be exhausted. Adding a new API key to the SAME Google Cloud
//   project shares the same quota — you need a key from a DIFFERENT project.
//
// FIXES IN THIS FILE:
//   1. Correct error detection — catches ALL known Gemini error types properly
//   2. Fallback key system  — tries GEMINI_API_KEY, then GEMINI_API_KEY_2
//   3. Fallback model system — tries gemini-2.0-flash, then gemini-1.5-flash
//   4. Lazy initialization  — clients created on first call, not at module load
//      (prevents startup crash if .env is missing; gives a clean error instead)
//   5. Detailed logging     — you can see exactly which key/model is being used
//
// HOW TO ADD A SECOND API KEY:
//   In your .env file, add:
//     GEMINI_API_KEY=AIza...your_primary_key
//     GEMINI_API_KEY_2=AIza...your_backup_key  ← must be from a DIFFERENT Google Cloud project
//
// NOTE: Two keys from the same Google Cloud project share the same quota.
//       Create a second project at console.cloud.google.com to get independent quota.

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ── Model priority list — tries in order until one works
const MODEL_PRIORITY = [
  "gemini-3-flash-preview",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

// ── Lazy-initialized client map  { apiKey: GoogleGenerativeAI }
const _clients = new Map();

/**
 * Returns a GoogleGenerativeAI client for the given key.
 * Creates one if not yet cached.
 */
const getClient = (apiKey) => {
  if (!_clients.has(apiKey)) {
    _clients.set(apiKey, new GoogleGenerativeAI(apiKey));
  }
  return _clients.get(apiKey);
};

/**
 * Collects all configured API keys (in priority order).
 * Throws a clear error if NONE are configured.
 */
const getApiKeys = () => {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter((k) => k && k.trim().length > 0);

  if (keys.length === 0) {
    throw new Error(
      "No Gemini API key found. Add GEMINI_API_KEY to your .env file.\n" +
        "Get a key at: https://aistudio.google.com/app/apikey",
    );
  }

  return keys;
};

/**
 * Classifies a Gemini SDK error into one of three categories:
 *   "key_invalid"  — the API key is wrong, missing, or lacks permissions
 *   "quota"        — rate limit or daily quota exceeded (try next key)
 *   "other"        — model not found, network error, etc.
 */
const classifyError = (err) => {
  const msg = (err.message || "").toLowerCase();
  const status = err.status || err.statusCode || 0;

  // API key errors — message from Google's REST API
  if (
    msg.includes("api key not valid") ||
    msg.includes("api_key_invalid") ||
    msg.includes("invalid api key") ||
    msg.includes("permission_denied") ||
    msg.includes("permission denied") ||
    status === 403
  ) {
    return "key_invalid";
  }

  // Quota / rate limit errors
  if (
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource_exhausted") ||
    msg.includes("too many requests") ||
    msg.includes("429") ||
    status === 429
  ) {
    return "quota";
  }

  // Model not found or deprecated
  if (
    msg.includes("not found") ||
    msg.includes("model_not_found") ||
    status === 404
  ) {
    return "model_not_found";
  }

  return "other";
};

// ── Resume data extraction prompt
const buildPrompt = (resumeText) =>
  `
You are a resume data extractor. Extract information from the resume below and return a JSON object.

Resume:
${resumeText}

Return ONLY this exact JSON structure. No markdown, no code fences, no explanation:
{
  "name": "full name",
  "title": "job title or role",
  "email": "email address",
  "phone": "phone number",
  "location": "city, country",
  "summary": "2-3 sentence professional summary",
  "skills": "skill1, skill2, skill3 (comma separated)",
  "experience": "Company — Role (Year-Year): Description. | Company — Role (Year-Year): Description.",
  "education": "Institution — Degree (Year). | Institution — Degree (Year).",
  "projects": "Project: Description. Tech: stack. | Project: Description. Tech: stack.",
  "certifications": "cert1, cert2 (comma separated, or empty string)",
  "linkedin": "full linkedin URL or empty string",
  "github": "full github URL or empty string",
  "portfolio": "portfolio URL or empty string"
}

Rules:
- Return ONLY the JSON object. Nothing before or after it.
- If a field is not found, use an empty string "".
- For skills: comma-separated list of technologies.
- Use " | " as separator when combining multiple items.
`.trim();

/**
 * Tries a single (apiKey, modelName) combination.
 * Returns { ok: true, text } on success.
 * Returns { ok: false, errorType, message } on failure.
 */
const tryGenerate = async (apiKey, modelName, prompt) => {
  try {
    const client = getClient(apiKey);
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1500,
      },
    });

    const result = await model.generateContent(prompt);
    let text = result.response.text()?.trim();

    // Fix: ensure valid JSON starts correctly
    if (text && !text.startsWith("{")) {
      const startIndex = text.indexOf("{");
      if (startIndex !== -1) {
        text = text.substring(startIndex);
      }
    }

    console.log(
      `✅  Gemini success — model: ${modelName}, key: ...${apiKey.slice(-6)}`,
    );
    return { ok: true, text };
  } catch (err) {
    const errorType = classifyError(err);
    console.warn(
      `⚠️  Gemini failed — model: ${modelName}, key: ...${apiKey.slice(-6)}, ` +
        `type: ${errorType}, msg: ${err.message?.substring(0, 120)}`,
    );
    return { ok: false, errorType, message: err.message };
  }
};

/**
 * Core generation function with full fallback chain.
 *
 * Strategy:
 *   For each API key (primary → backup):
 *     For each model (gemini-2.0-flash → gemini-1.5-flash → ...):
 *       Try to generate.
 *       If quota/key_invalid → try next key (skip remaining models for this key).
 *       If model_not_found → try next model with same key.
 *       If other error → try next model with same key.
 *
 * @param {string} resumeText
 * @param {string} template  - HTML with {{placeholders}}
 * @returns {string}          - Final filled HTML
 */
const generatePortfolioHTML = async (resumeText, template) => {
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error(
      "Resume text is too short (minimum 50 characters). Please provide more detail.",
    );
  }
  if (!template || template.trim().length < 20) {
    throw new Error("Invalid HTML template provided.");
  }

  const apiKeys = getApiKeys(); // throws if none configured
  const prompt = buildPrompt(resumeText);

  let lastError = "Unknown error";
  let allQuotaExhausted = true; // assume worst case

  // ── Outer loop: API keys
  for (const apiKey of apiKeys) {
    // ── Inner loop: model fallbacks
    for (const modelName of MODEL_PRIORITY) {
      const result = await tryGenerate(apiKey, modelName, prompt);

      if (result.ok) {
        // ── Parse the JSON Gemini returned
        let raw = result.text
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();

        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          console.error(
            "Gemini returned non-JSON (first 300 chars):",
            raw.substring(0, 300),
          );
          // Treat as a transient error and try next model
          lastError = "Gemini returned unexpected non-JSON output.";
          continue;
        }

        // ── Replace {{placeholders}} in template
        let finalHTML = template;
        for (const [key, value] of Object.entries(data)) {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
          finalHTML = finalHTML.replace(regex, String(value || ""));
        }
        // Clean up any remaining unfilled placeholders
        finalHTML = finalHTML.replace(/\{\{[a-z_]+\}\}/gi, "");

        // ── Validate result is real HTML
        if (!finalHTML.toLowerCase().trimStart().startsWith("<!doctype html")) {
          throw new Error(
            "Template does not start with <!DOCTYPE html>. Check your HTML template.",
          );
        }

        return finalHTML; // ✅ Success
      }

      // ── Handle failure
      lastError = result.message;

      if (result.errorType === "key_invalid") {
        // This key is broken — no point trying other models with it
        console.warn(
          `   Key ...${apiKey.slice(-6)} is invalid. Moving to next key.`,
        );
        allQuotaExhausted = false; // It's not a quota issue, it's a key issue
        break; // break inner (model) loop, try next key
      }

      if (result.errorType === "quota") {
        // Quota exhausted for this key — try next key
        console.warn(
          `   Key ...${apiKey.slice(-6)} quota exhausted. Moving to next key.`,
        );
        break; // break inner (model) loop, try next key
      }

      // model_not_found or other → try next model
    }
  }

  // ── All keys and models failed — give a helpful human-readable error
  const lowerLast = (lastError || "").toLowerCase();

  if (
    lowerLast.includes("api key not valid") ||
    lowerLast.includes("permission")
  ) {
    throw new Error(
      "Gemini API key is invalid. Please check GEMINI_API_KEY in your .env file.\n" +
        "Get a valid key at: https://aistudio.google.com/app/apikey",
    );
  }

  if (
    lowerLast.includes("quota") ||
    lowerLast.includes("resource_exhausted") ||
    lowerLast.includes("429")
  ) {
    throw new Error(
      "All Gemini API keys have exceeded their quota. " +
        "Add GEMINI_API_KEY_2 in .env with a key from a DIFFERENT Google Cloud project, " +
        "or wait until your quota resets (usually midnight Pacific Time).",
    );
  }

  throw new Error(`Gemini generation failed: ${lastError}`);
};

module.exports = { generatePortfolioHTML };
