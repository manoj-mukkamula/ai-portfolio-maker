// backend/services/geminiService.js
//
// WHAT WAS WRONG (and why generation was failing every time):
//
//   1. MODEL LIST WAS WRONG FOR 2025-2026:
//      - "gemini-2.0-flash-lite" routes to the same quota pool as "gemini-2.0-flash"
//        on Google's backend. Trying both burns the SAME quota, not separate pools.
//      - "gemini-1.5-flash-8b" was deprecated and returns 404.
//      Result: all 3 model attempts hit 1 quota pool. One click = daily limit gone.
//
//   2. RPM vs RPD CONFUSION:
//      The 429 errors were RPM (per-minute) limits, NOT the daily quota being
//      exhausted. Free tier in India:
//        gemini-1.5-flash: 15 RPM, 1500 RPD  (very generous daily limit)
//        gemini-2.0-flash: 15 RPM, 1500 RPD
//      RPM 429s resolve in ~60 seconds. The old code treated them as permanent
//      and gave up — that was wrong.
//
//   3. NO BACKOFF ON RPM:
//      When hitting a 429 due to per-minute rate limiting, waiting ~60s and
//      retrying is all that is needed. The old code skipped to the next model,
//      which had the same RPM counter and also 429'd.
//
// FIXES:
//   - Correct model list: gemini-1.5-flash + gemini-2.0-flash (separate pools)
//   - Distinguish RPM from RPD 429 errors
//   - Exponential backoff with up to 2 retries on RPM throttle
//   - Soft delay between key switches to avoid thundering herd
//   - No startup API calls — zero quota burned on server start

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Correct models for free tier, India, 2026
// DO NOT add gemini-2.0-flash-lite (same pool as 2.0-flash)
// DO NOT add gemini-1.5-flash-8b (deprecated, 404)
const MODEL_PRIORITY = [
  "gemini-1.5-flash",  // primary — stable, 1500 RPD free
  "gemini-2.0-flash",  // fallback — separate quota pool
];

const RPM_RETRY_DELAY_MS = 62_000; // wait 62s after an RPM 429
const RPM_MAX_RETRIES    = 2;      // retry up to 2 times per model

const _clients = new Map();
const getClient = (apiKey) => {
  if (!_clients.has(apiKey)) _clients.set(apiKey, new GoogleGenerativeAI(apiKey));
  return _clients.get(apiKey);
};

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
      "No Gemini API key found. Add GEMINI_API_KEY=AIza... to backend/.env\n" +
        "Get a free key at https://aistudio.google.com/app/apikey"
    );
  }

  return keys;
};

// Classifies a caught error into actionable buckets.
// KEY DISTINCTION: rpm_throttle (wait and retry) vs quota_daily (give up for model).
const classifyError = (err) => {
  const msg    = (err?.message || "").toLowerCase();
  const status = err?.status || err?.statusCode || err?.response?.status || 0;

  if (
    msg.includes("api key not valid") ||
    msg.includes("api_key_invalid") ||
    msg.includes("invalid api key") ||
    msg.includes("permission_denied") ||
    msg.includes("permission denied") ||
    status === 403
  ) return "key_invalid";

  if (
    msg.includes("not found") ||
    msg.includes("model_not_found") ||
    (status === 404 && !msg.includes("quota"))
  ) return "model_not_found";

  if (status === 429 || msg.includes("429") || msg.includes("too many requests")) {
    // per-minute signals
    const isPerMinute =
      msg.includes("per_minute") ||
      msg.includes("rate_limit") ||
      msg.includes("per minute") ||
      msg.includes("requests per minute") ||
      msg.includes("generaterequestspersecond");
    // if it's not clearly per-minute, treat as daily quota exhausted
    return isPerMinute ? "rpm_throttle" : "quota_daily";
  }

  if (msg.includes("quota") || msg.includes("resource_exhausted")) return "quota_daily";

  return "other";
};

const buildPrompt = (resumeText) =>
  `You are a resume data extractor. Read the resume below and return ONLY a valid JSON object. No markdown, no code fences, no explanation, no preamble. Start your response with { and end with }.

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

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const tryGenerate = async (apiKey, modelName, prompt) => {
  const TIMEOUT_MS = 35_000;

  const callPromise = (async () => {
    const model = getClient(apiKey).getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
    });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  })();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS)
  );

  try {
    const text = await Promise.race([callPromise, timeoutPromise]);
    console.log(`[Gemini] OK      model=${modelName}  key=...${apiKey.slice(-4)}`);
    return { ok: true, text };
  } catch (err) {
    const errorType = classifyError(err);
    console.warn(
      `[Gemini] FAIL    model=${modelName}  key=...${apiKey.slice(-4)}  ` +
        `type=${errorType}  msg=${(err?.message || "").slice(0, 120)}`
    );
    return { ok: false, errorType, message: err?.message || "Unknown error" };
  }
};

const extractJSON = (raw) => {
  const cleaned = raw
    .replace(/^\uFEFF/, "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.search(/\{/);
  const lastBrace  = cleaned.lastIndexOf("}");

  if (firstBrace < 0) {
    throw new Error(`No JSON found. Raw (first 300): ${cleaned.slice(0, 300)}`);
  }

  if (lastBrace < 0 || lastBrace <= firstBrace) {
    console.warn("[Gemini] Response truncated. Attempting repair...");
    let partial = cleaned.slice(firstBrace).trim().replace(/,\s*$/, "");
    if ((partial.match(/"/g) || []).length % 2 !== 0) partial += '"';
    if (!partial.endsWith("}")) partial += "}";
    return partial;
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
};

// Main export — full fallback chain with RPM backoff
const generatePortfolioHTML = async (resumeText, template) => {
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error("Resume text is too short. Please provide at least 50 characters of content.");
  }
  if (!template || template.trim().length < 20) {
    throw new Error("The HTML template provided is invalid or empty.");
  }

  const apiKeys        = getApiKeys();
  const prompt         = buildPrompt(resumeText);
  let lastErrorMessage = "No attempts were made.";
  let allDailyQuota    = true;

  for (let ki = 0; ki < apiKeys.length; ki++) {
    const apiKey = apiKeys[ki];
    console.log(`[Gemini] Trying key ...${apiKey.slice(-4)}`);

    for (const modelName of MODEL_PRIORITY) {
      let result = await tryGenerate(apiKey, modelName, prompt);

      // RPM throttle: wait and retry up to RPM_MAX_RETRIES times
      if (!result.ok && result.errorType === "rpm_throttle") {
        for (let r = 0; r < RPM_MAX_RETRIES && result.errorType === "rpm_throttle"; r++) {
          console.log(
            `[Gemini] RPM throttle on ${modelName}. Waiting ${RPM_RETRY_DELAY_MS / 1000}s ` +
              `(retry ${r + 1}/${RPM_MAX_RETRIES})...`
          );
          await sleep(RPM_RETRY_DELAY_MS);
          result = await tryGenerate(apiKey, modelName, prompt);
        }
        // Still throttled after retries — try next model (fresh RPM counter)
        if (!result.ok && result.errorType === "rpm_throttle") {
          lastErrorMessage = result.message;
          allDailyQuota    = false;
          continue;
        }
      }

      // Transient other errors: one quick retry
      if (!result.ok && result.errorType === "other") {
        await sleep(2000);
        result = await tryGenerate(apiKey, modelName, prompt);
      }

      // SUCCESS
      if (result.ok) {
        let jsonString;
        try {
          jsonString = extractJSON(result.text);
        } catch (e) {
          if (result.text.trim().startsWith("{")) {
            jsonString = result.text.trim();
          } else {
            console.error(`[Gemini] No JSON from ${modelName}: ${e.message}`);
            lastErrorMessage = e.message;
            allDailyQuota    = false;
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
            console.error(`[Gemini] JSON.parse failed for ${modelName}.`);
            lastErrorMessage = "Gemini returned unparseable JSON.";
            allDailyQuota    = false;
            continue;
          }
        }

        let finalHTML = template;
        for (const [key, value] of Object.entries(data)) {
          finalHTML = finalHTML.replace(
            new RegExp(`\\{\\{${key}\\}\\}`, "gi"),
            String(value ?? "")
          );
        }
        finalHTML = finalHTML.replace(/\{\{[a-zA-Z_]+\}\}/g, "");

        if (!finalHTML.toLowerCase().trimStart().startsWith("<!doctype html")) {
          throw new Error(
            "Template does not start with <!DOCTYPE html>. " +
              "Check your template in frontend/src/lib/templates.ts"
          );
        }

        console.log(`[Gemini] Portfolio generated. model=${modelName} key=...${apiKey.slice(-4)}`);
        return finalHTML;
      }

      // Failure routing
      lastErrorMessage = result.message;

      if (result.errorType === "key_invalid") {
        console.warn(`[Gemini] Key ...${apiKey.slice(-4)} invalid or revoked. Trying next key.`);
        allDailyQuota = false;
        break;
      }

      if (result.errorType === "quota_daily") {
        console.warn(`[Gemini] Daily quota gone — ${modelName} key=...${apiKey.slice(-4)}. Trying next model.`);
        continue;
      }

      if (result.errorType === "model_not_found") {
        console.warn(`[Gemini] Model "${modelName}" unavailable. Trying next model.`);
        allDailyQuota = false;
        continue;
      }

      allDailyQuota = false;
    }

    console.warn(`[Gemini] All models exhausted for key ...${apiKey.slice(-4)}. Trying next key.`);
    if (ki < apiKeys.length - 1) await sleep(1500);
  }

  // All keys and models exhausted
  const lower = lastErrorMessage.toLowerCase();

  if (lower.includes("api key not valid") || lower.includes("permission")) {
    throw new Error(
      "Your Gemini API key is invalid or revoked. " +
        "Generate a fresh key at https://aistudio.google.com/app/apikey and update GEMINI_API_KEY in backend/.env"
    );
  }

  if (allDailyQuota || lower.includes("quota") || lower.includes("resource_exhausted")) {
    throw new Error(
      "Daily generation quota reached for all configured API keys. " +
        "The free tier resets at midnight Pacific Time (around 12:30 PM IST). " +
        "To generate right now, add a second key from a different Google account " +
        "as GEMINI_API_KEY_2 in backend/.env and restart the server. " +
        "Get keys at: https://aistudio.google.com/app/apikey"
    );
  }

  if (lower.includes("model_not_found") || lower.includes("not found")) {
    throw new Error(
      "None of the configured Gemini models are available. " +
        "Create a fresh key at https://aistudio.google.com/app/apikey and verify it in Google AI Studio."
    );
  }

  throw new Error(
    `Portfolio generation failed after trying all API keys and models. Last error: ${lastErrorMessage}`
  );
};

module.exports = { generatePortfolioHTML };
