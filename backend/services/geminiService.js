// services/geminiService.js
// Handles all communication with Google Gemini AI.
// Sends resume text + HTML template → Gemini fills in the placeholders
// and returns a complete, valid HTML portfolio page.

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Validate API key at startup — fail fast rather than at request time
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in .env");
}

// Initialize Gemini client with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Builds the prompt sent to Gemini.
 * The AI must fill all {{placeholder}} values using data from the resume,
 * while keeping the HTML structure, CSS, and layout intact.
 */
const buildPrompt = (resumeText, template) => `
You are a professional web developer and resume-to-portfolio conversion expert.

Your task is to fill the HTML template below using data extracted from the resume.

RESUME:
${resumeText}

HTML TEMPLATE:
${template}

STRICT RULES:
1. Replace ALL placeholders like {{name}}, {{email}}, {{skills}}, {{experience}}, {{education}}, {{projects}}, {{location}}, {{phone}}, {{github}}, {{linkedin}} etc.
2. If a piece of information is NOT in the resume, use a reasonable placeholder like "" or "Not provided"
3. Do NOT change the HTML structure, CSS, class names, IDs, or inline styles
4. Do NOT add new HTML sections or remove existing ones
5. For skill lists, generate individual skill items using the template's existing HTML structure
6. For experience/project lists, repeat the template's existing list item structure for each entry
7. Return ONLY the complete HTML — no markdown, no explanations, no code fences
8. Your response MUST start with <!DOCTYPE html> and end with </html>
9. Ensure all links are valid (use "#" for missing URLs)
`;

/**
 * Main function: calls Gemini with resume text + HTML template.
 * Returns the filled-in HTML string ready to store and render.
 *
 * @param {string} resumeText - Extracted plain text from the user's resume
 * @param {string} template - HTML template with {{placeholder}} variables
 * @returns {Promise<string>} - Complete HTML portfolio page
 */
const generatePortfolioHTML = async (resumeText, template) => {
  // Input validation
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error("Resume text is too short. Please provide more detail.");
  }
  if (!template || template.trim().length < 20) {
    throw new Error("Invalid HTML template provided.");
  }

  try {
    // Use gemini-1.5-flash — fast, cost-efficient, handles long HTML well
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const result = await model.generateContent(buildPrompt(resumeText, template));
    const response = result.response;

    if (!response) {
      throw new Error("Empty response received from Gemini API.");
    }

    let html = response.text()?.trim();

    if (!html) {
      throw new Error("Gemini returned no content.");
    }

    // Strip markdown code fences if present (model sometimes wraps in ```html ... ```)
    html = html
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // Validate the output is real HTML
    if (!html.toLowerCase().startsWith("<!doctype html")) {
      throw new Error("Gemini returned invalid output — response does not start with <!DOCTYPE html>.");
    }

    return html;
  } catch (err) {
    console.error("Gemini API error:", err.message);
    // Rethrow with a clear message for the error handler
    throw new Error(`Portfolio generation failed: ${err.message}`);
  }
};

module.exports = { generatePortfolioHTML };