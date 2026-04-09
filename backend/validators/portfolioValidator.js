// validators/portfolioValidator.js
//
// ⚠️  With the new HTML-based architecture, Gemini returns complete HTML — NOT JSON.
//     So there is NO AI response validation schema here anymore.
//
// This file is kept for any future request-level Zod reuse.
// The generate + update schemas now live directly in portfolioController.js
// for simplicity and co-location.
//
// You can safely import from here if you want to centralise schemas later.

const { z } = require("zod");

// ── Kept for reference / future use ──

const generateRequestSchema = z.object({
  template:     z.string().min(20, "HTML template is too short."),
  resumeText:   z.string().max(20000).optional(),
  templateName: z.string().max(50).optional().default("custom"),
});

const updatePortfolioSchema = z.object({
  html:         z.string().min(20).optional(),
  templateName: z.string().max(50).optional(),
});

module.exports = { generateRequestSchema, updatePortfolioSchema };
