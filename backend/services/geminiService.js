// backend/services/geminiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Models tried in order only if the previous one fails.
// gemini-2.0-flash-preview is tried first as it is the most capable free-tier model.
const MODEL_PRIORITY = [
  "gemini-2.0-flash-preview",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash-lite",
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
    status === 404
  ) {
    return "model_not_found";
  }

  return "other";
};

// Prompt that asks Gemini to extract resume data as clean JSON only
const buildPrompt = (resumeText) =>
  `You are a resume data extractor. Read the resume below and return ONLY a JSON object. No markdown, no code fences, no explanation, nothing else before or after the JSON.

Resume:
${resumeText}

Return exactly this structure with real values filled in:
{
  "name": "full name",
  "title": "job title or professional role",
  "email": "email address",
  "phone": "phone number",
  "location": "city, country",
  "summary": "2 to 3 sentence professional summary written in third person",
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
- Do not wrap the response in markdown or add any text outside the JSON.`;

// Makes a single Gemini API call. Returns { ok, text } or { ok: false, errorType, message }.
// This function NEVER throws. All errors are caught and returned as structured data.
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
    const text = result.response.text().trim();

    console.log(
      `[Gemini] OK  model=${modelName}  key=...${apiKey.slice(-6)}`
    );
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
 * extractJSON
 *
 * Robustly pulls out a JSON object from whatever Gemini returned.
 * Gemini sometimes prepends text like "Result Construction..." or wraps
 * the JSON in markdown code fences. This function handles all of that.
 *
 * Strategy: find the FIRST { and the LAST } in the raw string and
 * slice between them. This works regardless of any surrounding text,
 * markdown fences, or preamble. We do this BEFORE any regex cleanup
 * because regex strip of "^```json" only works if the fence is at
 * position 0 of the string, which is not always the case.
 */
const extractJSON = (raw) => {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    // No JSON object found at all. Throw so the caller can handle it.
    throw new Error(
      `No JSON object found in Gemini response. Raw (first 300 chars): ${raw.slice(0, 300)}`
    );
  }

  return raw.slice(start, end + 1);
};

/**
 * generatePortfolioHTML
 *
 * Takes resume text and an HTML template with {{placeholders}}.
 * Calls Gemini once to extract resume data as JSON.
 * Replaces every {{key}} in the template with the extracted value.
 * Returns the final filled HTML string.
 *
 * Fallback order:
 *   For each API key (key1 then key2 then key3):
 *     For each model (gemini-2.0-flash-preview then gemini-1.5-flash then ...):
 *       Try once.
 *       Success + valid JSON  --> return immediately. ALL loops stop.
 *       Success + bad JSON    --> try next model with same key.
 *       quota or key_invalid  --> skip remaining models, try next key.
 *       model_not_found or other --> try next model with same key.
 *
 * The function exits as soon as ONE successful + parseable call is made.
 * Under normal conditions only ONE Gemini API call is made.
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

  // Use a labeled outer loop so we can break out of BOTH loops at once
  // from inside the inner loop when we need to skip to the next key.
  outerLoop: for (const apiKey of apiKeys) {
    for (const modelName of MODEL_PRIORITY) {
      const result = await tryGenerate(apiKey, modelName, prompt);

      // ----------------------------------------------------------------
      // SUCCESS PATH: Gemini returned a response. Now try to parse it.
      // ----------------------------------------------------------------
      if (result.ok) {
        let jsonString;
        try {
          jsonString = extractJSON(result.text);
        } catch (extractErr) {
          // Response came back but contained no JSON at all.
          // This is very rare. Log and try the next model.
          console.error(
            `[Gemini] Could not find JSON in response from model=${modelName}. ` +
              extractErr.message
          );
          lastErrorMessage = extractErr.message;
          continue; // try next model
        }

        let data;
        try {
          data = JSON.parse(jsonString);
        } catch (parseErr) {
          // extractJSON found { and } but the content between them is
          // still not valid JSON. Log the raw excerpt and try the next model.
          console.error(
            `[Gemini] JSON.parse failed on extracted string from model=${modelName}. ` +
              `Extracted (first 300 chars): ${jsonString.slice(0, 300)}`
          );
          lastErrorMessage =
            "Gemini returned a response that could not be parsed as valid JSON.";
          continue; // try next model
        }

        // All good. Fill the template.
        let finalHTML = template;
        for (const [key, value] of Object.entries(data)) {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
          finalHTML = finalHTML.replace(regex, String(value ?? ""));
        }

        // Remove any placeholders that were not filled by the AI response
        finalHTML = finalHTML.replace(/\{\{[a-zA-Z_]+\}\}/g, "");

        // Sanity check: the result must be a complete HTML document
        if (!finalHTML.toLowerCase().trimStart().startsWith("<!doctype html")) {
          throw new Error(
            "The selected template does not start with <!DOCTYPE html>. " +
              "Please check your template file."
          );
        }

        console.log(
          `[Gemini] Portfolio generated successfully. model=${modelName}  key=...${apiKey.slice(-6)}`
        );

        // SUCCESS. Return immediately. No further models or keys will be tried.
        return finalHTML;
      }

      // ----------------------------------------------------------------
      // FAILURE PATH: Gemini call itself failed (network, auth, quota, etc.)
      // ----------------------------------------------------------------
      lastErrorMessage = result.message;

      if (result.errorType === "key_invalid") {
        console.warn(
          `[Gemini] Key ...${apiKey.slice(-6)} is invalid. Skipping to next key.`
        );
        // Skip all remaining models for this key and go to the next key.
        continue outerLoop;
      }

      if (result.errorType === "quota") {
        console.warn(
          `[Gemini] Key ...${apiKey.slice(-6)} quota exhausted. Skipping to next key.`
        );
        // Skip all remaining models for this key and go to the next key.
        continue outerLoop;
      }

      // model_not_found or other transient error: fall through to next model
    }
    // End of inner model loop for this key. Move to the next key.
  }
  // End of outer key loop. Every combination failed.

  // Build a helpful final error message
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