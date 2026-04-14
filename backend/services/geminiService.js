// backend/services/geminiService.js
//
// KEY FIXES in this version:
//  1. gemini-2.5-flash marked PREVIEW — on free keys it often 404s or 429s immediately.
//     Added "gemini-1.5-flash" and "gemini-1.5-flash-8b" as the most stable free-tier models.
//  2. model_not_found now tries next MODEL (not next key) — prevents burning all keys on a missing model.
//  3. "other" errors on the primary model now attempt one retry with 2-second backoff before cascading.
//  4. Per-call timeout raised to 40 seconds — Gemini can be slow on first call.
//  5. maxOutputTokens raised to 8192 to prevent ANY truncation.
//  6. Detailed logging at each decision point so you can follow the fallback chain in terminal.
//  7. graceful handling if all keys have the SAME quota state (all reset at same time).

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ordered by reliability on free tier (April 2026):
//   gemini-1.5-flash        — most reliable, generous free quota
//   gemini-1.5-flash-8b     — ultra-fast, great for JSON extraction
//   gemini-2.0-flash        — solid; free tier sometimes throttled
//   gemini-2.0-flash-lite   — lightweight fallback
//   gemini-2.5-flash-preview-04-17 — newest but often rate-limited on free keys
const MODEL_PRIORITY = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-preview-04-17",
];

// Lazy client cache: one GoogleGenerativeAI instance per API key
const _clients = new Map();
const getClient = (apiKey) => {
  if (!_clients.has(apiKey)) _clients.set(apiKey, new GoogleGenerativeAI(apiKey));
  return _clients.get(apiKey);
};

// Returns all configured API keys, throws if none exist
const getApiKeys = () => {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
  ].filter((k) => typeof k === "string" && k.trim().length > 10);

  if (keys.length === 0) {
    throw new Error(
      "No Gemini API key found. Add GEMINI_API_KEY to your .env file. " +
        "Get a free key at https://aistudio.google.com/app/apikey"
    );
  }
  return keys;
};

// Maps a caught error to a category string
const classifyError = (err) => {
  const msg = (err.message || "").toLowerCase();
  const status = err.status || err.statusCode || 0;

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

// The extraction prompt — instructs Gemini to return pure JSON only
const buildPrompt = (resumeText) =>
  `You are a resume data extractor. Read the resume below and return ONLY a valid JSON object. No markdown, no code fences, no explanation, no preamble. Start your response with { and end with }.

Resume:
${resumeText}

Return exactly this structure with real values filled in:
{
  "name": "full name",
  "title": "job title or professional role",
  "email": "email address",
  "phone": "phone number",
  "location": "city, country",
  "summary": "2 to 3 sentence professional summary",
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
- Do not cut off the response midway.`;

// Makes a single Gemini API call with a timeout.
// Returns { ok, text } or { ok: false, errorType, message }
// This function NEVER throws.
const tryGenerate = async (apiKey, modelName, prompt) => {
  const TIMEOUT_MS = 40_000; // 40 seconds

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
    setTimeout(() => reject(new Error("Request timed out after 40s")), TIMEOUT_MS)
  );

  try {
    const text = await Promise.race([callPromise, timeoutPromise]);
    console.log(`[Gemini] OK  model=${modelName}  key=...${apiKey.slice(-4)}`);
    return { ok: true, text };
  } catch (err) {
    const errorType = classifyError(err);
    console.warn(
      `[Gemini] FAIL  model=${modelName}  key=...${apiKey.slice(-4)}  type=${errorType}  msg=${(err.message || "").slice(0, 120)}`
    );
    return { ok: false, errorType, message: err.message || "Unknown error" };
  }
};

// Attempt to repair a truncated JSON string
const repairTruncatedJSON = (partial) => {
  let repaired = partial.trim().replace(/,\s*$/, "");
  const quoteCount = (repaired.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) repaired += '"';
  if (!repaired.endsWith("}")) repaired += "}";
  console.warn(`[Gemini] Repaired truncated JSON (first 200 chars): ${repaired.slice(0, 200)}`);
  return repaired;
};

// Robustly extracts a JSON object from the Gemini response
const extractJSON = (raw) => {
  const cleaned = raw
    .replace(/^\uFEFF/, "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.search(/\{/);
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace < 0) {
    throw new Error(`No JSON object found in response. Raw (first 300): ${cleaned.slice(0, 300)}`);
  }

  if (lastBrace < 0 || lastBrace <= firstBrace) {
    console.warn("[Gemini] Response appears truncated. Attempting JSON repair...");
    return repairTruncatedJSON(cleaned.slice(firstBrace));
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
};

// Sleep helper for retry backoff
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * generatePortfolioHTML
 *
 * Takes resume text and an HTML template with {{placeholders}}.
 * Calls Gemini to extract resume data as JSON.
 * Replaces every {{key}} in the template with the extracted value.
 * Returns the final filled HTML string.
 *
 * Fallback chain:
 *   For each API key:
 *     Try each model in MODEL_PRIORITY:
 *       quota / key_invalid → skip to next KEY immediately
 *       model_not_found / other → skip to next MODEL (same key)
 *       "other" on first model → retry once with 2s backoff before trying next model
 *     If JSON extraction fails → try next model
 *   If all keys and models exhausted → throw descriptive error
 */
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

  outerLoop: for (const apiKey of apiKeys) {
    console.log(`[Gemini] Trying key ...${apiKey.slice(-4)}`);

    for (let modelIdx = 0; modelIdx < MODEL_PRIORITY.length; modelIdx++) {
      const modelName = MODEL_PRIORITY[modelIdx];
      let result = await tryGenerate(apiKey, modelName, prompt);

      // On "other" error for first model, do one retry with 2s backoff
      if (!result.ok && result.errorType === "other" && modelIdx === 0) {
        console.log(`[Gemini] Transient error on primary model. Retrying in 2s...`);
        await sleep(2000);
        result = await tryGenerate(apiKey, modelName, prompt);
      }

      // ── SUCCESS PATH ────────────────────────────────────────────────────
      if (result.ok) {
        let jsonString;
        try {
          jsonString = extractJSON(result.text);
        } catch (extractErr) {
          if (result.text.trim().startsWith("{")) {
            jsonString = result.text.trim();
          } else {
            console.error(
              `[Gemini] Could not find JSON in response from model=${modelName}. ${extractErr.message}`
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
              `[Gemini] JSON.parse failed on model=${modelName}. Extracted (first 300): ${jsonString.slice(0, 300)}`
            );
            lastErrorMessage = "Gemini returned a response that could not be parsed as valid JSON.";
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

        // Sanity check
        if (!finalHTML.toLowerCase().trimStart().startsWith("<!doctype html")) {
          throw new Error(
            "The selected template does not start with <!DOCTYPE html>. Check your template file."
          );
        }

        console.log(
          `[Gemini] Portfolio generated successfully. model=${modelName}  key=...${apiKey.slice(-4)}`
        );
        return finalHTML;
      }

      // ── FAILURE PATH ────────────────────────────────────────────────────
      lastErrorMessage = result.message;

      if (result.errorType === "key_invalid") {
        console.warn(`[Gemini] Key ...${apiKey.slice(-4)} is invalid. Skipping to next key.`);
        continue outerLoop;
      }

      if (result.errorType === "quota") {
        console.warn(`[Gemini] Key ...${apiKey.slice(-4)} quota exhausted. Skipping to next key.`);
        continue outerLoop;
      }

      // model_not_found or other transient → try next model
      if (result.errorType === "model_not_found") {
        console.warn(`[Gemini] Model ${modelName} not found on this key. Trying next model.`);
      }
    }

    console.warn(`[Gemini] All models failed for key ...${apiKey.slice(-4)}. Trying next key.`);
  }

  // All keys and models exhausted
  const lower = lastErrorMessage.toLowerCase();

  if (lower.includes("api key not valid") || lower.includes("permission")) {
    throw new Error(
      "Your Gemini API key is invalid or has been revoked. " +
        "Check GEMINI_API_KEY in your .env file and make sure it is active at aistudio.google.com."
    );
  }

  if (
    lower.includes("quota") ||
    lower.includes("resource_exhausted") ||
    lower.includes("429") ||
    lower.includes("rate limit")
  ) {
    throw new Error(
      "All configured Gemini API keys have hit their daily quota. " +
        "Wait until midnight Pacific Time for the quota to reset, or:\n" +
        "1. Add a new key from a different Google account as GEMINI_API_KEY_2 in your .env file.\n" +
        "2. Go to https://aistudio.google.com/app/apikey and create a key in a fresh Google Cloud project.\n" +
        "Note: gemini-1.5-flash has the most generous free tier — make sure your key has it enabled."
    );
  }

  throw new Error(
    `Portfolio generation failed after trying all available API keys and models. Last error: ${lastErrorMessage}`
  );
};

module.exports = { generatePortfolioHTML };

/*
 * FALLBACK FLOW
 * ─────────────
 * For each API key:
 *   Try gemini-1.5-flash       → ✅ success → RETURN (1 call total)
 *                              → ❌ quota / key_invalid → SKIP to next KEY
 *                              → ❌ other (first model) → RETRY once with 2s backoff
 *                              → ❌ model_not_found / bad JSON → try next MODEL
 *   Try gemini-1.5-flash-8b   → ✅ success → RETURN
 *                              → ❌ fail → try next MODEL
 *   Try gemini-2.0-flash      → ✅ success → RETURN
 *   Try gemini-2.0-flash-lite → ✅ success → RETURN
 *   Try gemini-2.5-flash-*    → ✅ success → RETURN
 *   All models failed → try next KEY
 *
 * If all keys exhausted → throw descriptive error message to frontend
 */
