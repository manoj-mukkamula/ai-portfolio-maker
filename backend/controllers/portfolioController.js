// controllers/portfolioController.js — Portfolio CRUD + AI generation
//
// NEW FLOW:
//   resumeText + HTML template  →  Gemini fills placeholders  →  returns final HTML
//   Final HTML stored in DB  →  Frontend renders via iframe.srcDoc
//
// Removed: JSON validation (Zod), data field, sourceText, template enum

const { z } = require("zod");
const Portfolio = require("../models/Portfolio");
const User = require("../models/User");
const { parseResume } = require("../utils/resumeParser");
const { generatePortfolioHTML } = require("../services/geminiService");

// ── Zod schema for POST /api/portfolio/generate body
const generateRequestSchema = z.object({
  template: z.string().min(20, "HTML template is too short to be valid."),
  resumeText: z.string().max(20000, "Resume text too long.").optional(),
  templateName: z.string().max(50).optional().default("custom"),
});

// ── Zod schema for PUT /api/portfolio/:id
const updatePortfolioSchema = z.object({
  html: z.string().min(20, "HTML content too short.").optional(),
  templateName: z.string().max(50).optional(),
});

/**
 * POST /api/portfolio/generate
 * Accepts: multipart/form-data (resume file) OR JSON body (resumeText)
 * Always requires: template (HTML string with {{placeholders}})
 */
const generate = async (req, res, next) => {
  try {
    // 1. Validate request body
    const parsed = generateRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors.map((e) => e.message).join(". "),
      });
    }

    const { template, resumeText: rawText, templateName } = parsed.data;

    // 2. Credit check — always fetch fresh from DB
    const user = await User.findById(req.user._id);
    if (user.credits <= 0) {
      return res.status(403).json({
        success: false,
        message: "Insufficient credits. You need at least 1 credit to generate a portfolio.",
      });
    }

    // 3. Get resume text — from uploaded file OR pasted text in body
    let resumeText = "";
    if (req.file) {
      resumeText = await parseResume(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
    } else if (rawText && rawText.trim().length > 0) {
      resumeText = rawText.trim();
    } else {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF/DOCX resume file or provide resumeText in the body.",
      });
    }

    // 4. Send to Gemini → get back filled HTML
    const finalHTML = await generatePortfolioHTML(resumeText, template);

    // 5. Save to DB + deduct 1 credit atomically
    const [portfolio] = await Promise.all([
      Portfolio.create({
        userId: user._id,
        html: finalHTML,
        templateName,
      }),
      User.findByIdAndUpdate(user._id, { $inc: { credits: -1 } }),
    ]);

    res.status(201).json({
      success: true,
      message: "Portfolio generated successfully.",
      creditsRemaining: user.credits - 1,
      portfolio: {
        id: portfolio._id,
        templateName: portfolio.templateName,
        createdAt: portfolio.createdAt,
        finalHTML,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/portfolio/history
 * Returns all portfolios for the authenticated user, newest first.
 * HTML field excluded (heavy) — frontend fetches it via GET /:id when needed.
 */
const getHistory = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id })
      .select("-html")           // Exclude large HTML field from list view
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: portfolios.length,
      portfolios,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/portfolio/:id
 * Returns a single portfolio including its full HTML.
 */
const getOne = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found.",
      });
    }

    res.status(200).json({ success: true, portfolio });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/portfolio/:id
 * Allows manual HTML editing or templateName label update.
 * Used when user manually edits the generated HTML in the frontend editor.
 */
const update = async (req, res, next) => {
  try {
    const parsed = updatePortfolioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors.map((e) => e.message).join(". "),
      });
    }

    // Build update object — only include fields that were sent
    const updates = {};
    if (parsed.data.html) updates.html = parsed.data.html;
    if (parsed.data.templateName) updates.templateName = parsed.data.templateName;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update.",
      });
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Portfolio updated successfully.",
      portfolio,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/portfolio/:id
 */
const remove = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Portfolio deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { generate, getHistory, getOne, update, remove };
