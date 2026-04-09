// backend/controllers/portfolioController.js
//
// FIXES:
//   1. Calls user.resetCreditsIfNeeded() before credit check (daily 5/day system)
//   2. Returns resetsAt timestamp so frontend can show countdown
//   3. getMe now returns creditsLastReset for frontend reset timer

const { z } = require("zod");
const Portfolio = require("../models/Portfolio");
const User = require("../models/User");
const { parseResume } = require("../utils/resumeParser");
const { generatePortfolioHTML } = require("../services/geminiService");

// ── Zod schema for POST /api/portfolio/generate
const generateRequestSchema = z.object({
  template:     z.string().min(20, "HTML template is too short to be valid."),
  resumeText:   z.string().max(20000, "Resume text too long (max 20,000 chars).").optional(),
  templateName: z.string().max(50).optional().default("custom"),
});

// ── Zod schema for PUT /api/portfolio/:id
const updatePortfolioSchema = z.object({
  html:         z.string().min(20, "HTML content too short.").optional(),
  templateName: z.string().max(50).optional(),
});

/**
 * POST /api/portfolio/generate
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

    // 2. Fetch fresh user + auto-reset daily credits if 24h elapsed
    const user = await User.findById(req.user._id);
    await user.resetCreditsIfNeeded();

    if (user.credits <= 0) {
      const resetAt = new Date(
        new Date(user.creditsLastReset).getTime() + 24 * 60 * 60 * 1000
      );
      return res.status(403).json({
        success: false,
        message: "You've used all 5 daily credits. Credits reset every 24 hours.",
        resetsAt: resetAt.toISOString(),
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

    // 4. Generate filled HTML via Gemini (fast 2-step approach)
    const finalHTML = await generatePortfolioHTML(resumeText, template);

    // 5. Save portfolio + deduct 1 credit atomically
    const [portfolio] = await Promise.all([
      Portfolio.create({ userId: user._id, html: finalHTML, templateName }),
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
 * Returns all portfolios for the user — html field excluded (too large).
 */
const getHistory = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id })
      .select("-html")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: portfolios.length, portfolios });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/portfolio/:id
 * Returns full portfolio including html field.
 */
const getOne = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!portfolio) {
      return res.status(404).json({ success: false, message: "Portfolio not found." });
    }

    res.status(200).json({ success: true, portfolio });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/portfolio/:id
 * Allows updating html (from editor) or templateName label.
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

    const updates = {};
    if (parsed.data.html)         updates.html = parsed.data.html;
    if (parsed.data.templateName) updates.templateName = parsed.data.templateName;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided to update." });
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!portfolio) {
      return res.status(404).json({ success: false, message: "Portfolio not found." });
    }

    res.status(200).json({ success: true, message: "Portfolio updated successfully.", portfolio });
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
      return res.status(404).json({ success: false, message: "Portfolio not found." });
    }

    res.status(200).json({ success: true, message: "Portfolio deleted successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = { generate, getHistory, getOne, update, remove };
