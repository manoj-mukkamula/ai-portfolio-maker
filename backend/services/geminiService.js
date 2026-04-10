// backend/services/geminiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Only real, free-tier working models in 2025. No preview/fake model names.
// The list is tried in order only if the previous one fails.
const MODEL_PRIORITY = [
  "gemini-3-flash-preview",
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

// Strips JSON out of a string even if Gemini added markdown fences
const extractJSON = (raw) => {
  let cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // If the string does not start with { find the first { and trim from there
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  return cleaned;
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
 *     For each model (gemini-1.5-flash then gemini-1.5-flash-8b then ...):
 *       Try once.
 *       Success  --> return immediately, no further calls.
 *       quota or key_invalid --> skip remaining models, try next key.
 *       model_not_found or other --> try next model with same key.
 *
 * The function exits as soon as ONE call succeeds.
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

  // Outer loop: try each API key in order
  for (const apiKey of apiKeys) {
    // Inner loop: try each model in order for this key
    for (const modelName of MODEL_PRIORITY) {
      const result = await tryGenerate(apiKey, modelName, prompt);

      // ----------------------------------------------------------------
      // SUCCESS PATH
      // ----------------------------------------------------------------
      if (result.ok) {
        const raw = extractJSON(result.text);

        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          // Gemini returned something that is not valid JSON. Log it and
          // try the next model. This is rare but can happen occasionally.
          console.error(
            `[Gemini] JSON parse failed on response from model=${modelName}. ` +
              `Raw (first 200 chars): ${raw.slice(0, 200)}`
          );
          lastErrorMessage =
            "Gemini returned output that could not be parsed as JSON. Retrying with next model.";
          // Continue to the next model (do NOT return, do NOT break outer loop)
          continue;
        }

        // Fill {{placeholders}} in the template
        let finalHTML = template;
        for (const [key, value] of Object.entries(data)) {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
          finalHTML = finalHTML.replace(regex, String(value ?? ""));
        }

        // Remove any placeholders that were not filled
        finalHTML = finalHTML.replace(/\{\{[a-zA-Z_]+\}\}/g, "");

        // Sanity check: the result must be a complete HTML document
        if (!finalHTML.toLowerCase().trimStart().startsWith("<!doctype html")) {
          throw new Error(
            "The selected template does not start with <!DOCTYPE html>. " +
              "Please check your template file."
          );
        }

        // One clean success log so you can confirm exactly one call was made
        console.log(
          `[Gemini] Portfolio generated successfully. model=${modelName}  key=...${apiKey.slice(-6)}`
        );

        return finalHTML; // <-- ONLY exit point on success. Execution stops here.
      }

      // ----------------------------------------------------------------
      // FAILURE PATH
      // ----------------------------------------------------------------
      lastErrorMessage = result.message;

      if (result.errorType === "key_invalid") {
        // This key will not work at all. No point trying other models with it.
        console.warn(
          `[Gemini] Key ...${apiKey.slice(-6)} is invalid. Skipping to next key.`
        );
        break; // exits the inner (model) loop, moves to the next API key
      }

      if (result.errorType === "quota") {
        // Daily or per-minute quota hit for this key. Try the next key.
        console.warn(
          `[Gemini] Key ...${apiKey.slice(-6)} quota exhausted. Skipping to next key.`
        );
        break; // exits the inner (model) loop, moves to the next API key
      }

      // model_not_found or other transient error: try the next model with the same key
    }
    // End of inner model loop. If we broke out, we move to the next apiKey here.
  }
  // End of outer key loop. If we reach here, every combination failed.

  // Build a helpful error message based on what failed last
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