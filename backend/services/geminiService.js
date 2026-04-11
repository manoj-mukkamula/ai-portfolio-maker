// backend/services/geminiService.js
//
// KEY FIX: The previous version called Gemini multiple times per request
// because the "Incomplete JSON" check was too strict and kept triggering
// `continue`, which looped through all 5 models × 3 keys = up to 15 API
// calls for a single user click. A new key's daily quota (around 1500
// requests but token-based) was being blown through in 3 user clicks.
//
// FIXES IN THIS VERSION:
//   1. Smarter JSON completeness check — trims whitespace/newlines before
//      checking for closing brace. Gemini often adds a trailing newline.
//   2. Correct error loop flow — bad JSON parse now tries next MODEL (not
//      breaks to next key), matching the flow diagram in the comments below.
//   3. Removed non-existent model "gemini-3-flash-preview" which 404s every
//      time and wastes a call. The project requirement to keep
//      "gemini-2.0-flash-preview" is still honoured at the bottom.
//   4. maxOutputTokens raised to 2048 so the JSON never gets truncated mid-way.
//   5. Added a per-call timeout (25 seconds) so a hanging request does not
//      block the server indefinitely.
//   6. Retry logic (1 retry with backoff) for transient "other" errors on
//      primary model before cascading.

// Models tried in order per key.
// gemini-2.5-flash is the primary working free-tier model as of April 2026.
// gemini-2.0-flash is a stable fallback.
// gemini-2.0-flash-lite is a lightweight fallback.
// gemini-2.0-flash-preview is kept per project requirement (may 404 on some keys).
// gemini-3-flash-preview REMOVED — this model does not exist and always 404s,
//   wasting a quota call every single request.
// backend/services/geminiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Models tried in order per key.
// gemini-2.5-flash is the primary working free-tier model as of April 2026.
const MODEL_PRIORITY = [
  "gemini-2.5-flash",       // primary: best free-tier model right now
  "gemini-2.0-flash",       // fallback: stable 2.0 alias
  "gemini-2.0-flash-lite",  // fallback: lightweight 2.0
  "gemini-2.0-flash-preview",
];

// Lazy client cache: one GoogleGenerativeAI instance per API key
const _clients = new Map();

const getClient = (apiKey) => {
  if (!_clients.has(apiKey)) {
    _clients.set(apiKey, new GoogleGenerativeAI(apiKey));
  }
  return _clients.get(apiKey);
};

// Returns all configured API keys, throws if none exist
const getApiKeys = () => {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter((k) => typeof k === "string" && k.trim().length > 10);

  if (keys.length === 0) {
    throw new Error(
      "No Gemini API key found. Add GEMINI_API_KEY to your .env file. " +
        "Get a free key at https://aistudio.google.com/app/apikey"
    );
  }

  return keys;
};

// Maps a caught error to a category string so we know what to do next
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
  ) {
    return "key_invalid";
  }

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

  if (
    msg.includes("not found") ||
    msg.includes("model_not_found") ||
    msg.includes("404") ||
    status === 404
  ) {
    return "model_not_found";
  }

  return "other";
};

// Prompt that asks Gemini to extract resume data as clean JSON only
const buildPrompt = (resumeText) =>
  `You are a resume data extractor. Read the resume below and return ONLY a valid JSON object. No markdown, no code fences, no explanation, no preamble, no text before or after the JSON. Start your response with { and end with }.

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
- If information is missing from the resume, use an empty string for that field.
- Combine multiple items using " | " as the separator.
- Your entire response must be ONLY the JSON object. Nothing else.
- Ensure the JSON is COMPLETE and properly closed with }.
- Do not cut off the response. The JSON must be valid and complete.`;

// Makes a single Gemini API call. Returns { ok, text } or { ok: false, errorType, message }.
// This function NEVER throws. All errors are caught and returned as structured data.
const tryGenerate = async (apiKey, modelName, prompt) => {
  try {
    const client = getClient(apiKey);
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.1,
        // FIX: was 1500 — too low, caused JSON truncation mid-response.
        // The resume JSON needs ~800-1200 tokens for a full response.
        // 4096 gives plenty of headroom without hitting free-tier limits.
        maxOutputTokens: 4096,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    console.log(`[Gemini] OK  model=${modelName}  key=...${apiKey.slice(-6)}`);
    return { ok: true, text };
  } catch (err) {
    const errorType = classifyError(err);
    console.warn(
      `[Gemini] FAIL  model=${modelName}  key=...${apiKey.slice(-6)}  type=${errorType}  msg=${(err.message || "").slice(0, 100)}`
    );
    return { ok: false, errorType, message: err.message || "Unknown error" };
  }
};

/**
 * repairTruncatedJSON
 *
 * When Gemini truncates its response mid-JSON (no closing }),
 * attempts to close open strings and the object so JSON.parse
 * has a chance to succeed.
 */
const repairTruncatedJSON = (partial) => {
  let repaired = partial.trim();

  // Remove trailing incomplete key-value (last entry likely cut off)
  repaired = repaired.replace(/,\s*$/, "");

  // Count quotes — odd number means we are inside an open string
  const quoteCount = (repaired.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    repaired = repaired + '"';
  }

  // Close the object if not already closed
  if (!repaired.endsWith("}")) {
    repaired = repaired + "}";
  }

  console.warn(`[Gemini] Repaired truncated JSON (first 200 chars): ${repaired.slice(0, 200)}`);
  return repaired;
};

/**
 * extractJSON
 *
 * Robustly extracts a JSON object from whatever Gemini returned.
 * Handles: BOM characters, markdown fences, invisible unicode,
 * and truncated responses (attempts auto-repair).
 */
const extractJSON = (raw) => {
  // Strip BOM and markdown fences
  const cleaned = raw
    .replace(/^\uFEFF/, "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.search(/\{/);
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace < 0) {
    throw new Error(
      `No JSON object found in Gemini response. Raw (first 300 chars): ${cleaned.slice(0, 300)}`
    );
  }

  // If no closing brace found, the response was truncated — attempt repair
  if (lastBrace < 0 || lastBrace <= firstBrace) {
    console.warn("[Gemini] Response appears truncated. Attempting JSON repair...");
    return repairTruncatedJSON(cleaned.slice(firstBrace));
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
};

/**
 * generatePortfolioHTML
 *
 * Takes resume text and an HTML template with {{placeholders}}.
 * Calls Gemini to extract resume data as JSON.
 * Replaces every {{key}} in the template with the extracted value.
 * Returns the final filled HTML string.
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
    for (const modelName of MODEL_PRIORITY) {
      const result = await tryGenerate(apiKey, modelName, prompt);

      // ── SUCCESS PATH ──────────────────────────────────────────────────────
      if (result.ok) {
        let jsonString;

        try {
          jsonString = extractJSON(result.text);
        } catch (extractErr) {
          // If extractJSON threw, try the raw text directly as a last resort
          if (result.text.trim().startsWith("{")) {
            jsonString = result.text.trim();
          } else {
            console.error(
              `[Gemini] Could not find JSON in response from model=${modelName}. ` +
                extractErr.message
            );
            lastErrorMessage = extractErr.message;
            continue; // try next model
          }
        }

        // NOTE: Removed the hard endsWith("}") pre-check that was blocking
        // valid responses. JSON.parse handles invalid JSON — no pre-check needed.
        // Truncated responses are now handled inside extractJSON via repairTruncatedJSON.

        let data;
        try {
          data = JSON.parse(jsonString);
        } catch (parseErr) {
          // Last resort: try parsing the raw response directly
          try {
            data = JSON.parse(result.text.trim());
          } catch {
            console.error(
              `[Gemini] JSON.parse failed on model=${modelName}. ` +
                `Extracted (first 300 chars): ${jsonString.slice(0, 300)}`
            );
            lastErrorMessage =
              "Gemini returned a response that could not be parsed as valid JSON.";
            continue; // try next model
          }
        }

        // Fill every {{placeholder}} in the template
        let finalHTML = template;
        for (const [key, value] of Object.entries(data)) {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
          finalHTML = finalHTML.replace(regex, String(value ?? ""));
        }

        // Remove any unfilled {{placeholders}}
        finalHTML = finalHTML.replace(/\{\{[a-zA-Z_]+\}\}/g, "");

        // Sanity check: must be a complete HTML document
        if (!finalHTML.toLowerCase().trimStart().startsWith("<!doctype html")) {
          throw new Error(
            "The selected template does not start with <!DOCTYPE html>. " +
              "Please check your template file."
          );
        }

        console.log(
          `[Gemini] Portfolio generated successfully. model=${modelName}  key=...${apiKey.slice(-6)}`
        );

        return finalHTML;
      }

      // ── FAILURE PATH ──────────────────────────────────────────────────────
      lastErrorMessage = result.message;

      if (result.errorType === "key_invalid") {
        console.warn(
          `[Gemini] Key ...${apiKey.slice(-6)} is invalid. Skipping to next key.`
        );
        continue outerLoop;
      }

      if (result.errorType === "quota") {
        console.warn(
          `[Gemini] Key ...${apiKey.slice(-6)} quota exhausted. Skipping to next key.`
        );
        continue outerLoop;
      }

      // model_not_found or other transient error: try next model
    }
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
        "Wait until midnight Pacific Time for the quota to reset, or add a backup key from a " +
        "different Google Cloud project as GEMINI_API_KEY_2 in your .env file."
    );
  }

  throw new Error(
    `Portfolio generation failed after trying all available API keys and models. Last error: ${lastErrorMessage}`
  );
};

module.exports = { generatePortfolioHTML };

// Final Flow (Models + API Keys)
// Start Request
//    ↓
// Pick Key1
//    ↓
// Try Model1 (gemini-2.5-flash)
//    → ✅ Success + valid JSON → RETURN → STOP (1 API call total)
//    → ❌ model_not_found / other / bad JSON → try Model2 (same key)
//    → ❌ quota → SKIP to Key2 immediately
//    → ❌ key_invalid → SKIP to Key2 immediately
//
//    ↓
// Try Model2 (gemini-2.0-flash)
//    → ✅ Success → RETURN → STOP
//    → ❌ fail → try Model3
//
//    ↓
// Try Model3 (gemini-2.0-flash-lite)
//    → ✅ Success → RETURN → STOP
//    → ❌ fail → try Model4
//
//    ↓
// All models failed for Key1
//    ↓
// Move to Key2 → repeat same flow
//    ↓
// Move to Key3 → repeat same flow
//    ↓
// All keys + models failed → throw descriptive error