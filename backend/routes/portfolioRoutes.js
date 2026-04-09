// routes/portfolioRoutes.js — Portfolio endpoints
// All routes are protected (require JWT).
// /generate accepts multipart/form-data (resume file + template field)
//   OR application/json (resumeText + template).

const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const { generateRateLimiter } = require("../middleware/rateLimiter");
const {
  generate,
  getHistory,
  getOne,
  update,
  remove,
} = require("../controllers/portfolioController");

const router = express.Router();

// ── Multer: memory storage, 5MB limit, PDF/DOCX only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF and DOCX files are allowed."));
  },
});

// ── All routes require valid JWT
router.use(protect);

// POST /api/portfolio/generate
// File upload: field name "resume" (optional — can also send resumeText in body)
// Template: sent as form field "template" (HTML string) or JSON body field "template"
router.post("/generate", generateRateLimiter, upload.single("resume"), generate);

// GET /api/portfolio/history  — list (html field excluded)
router.get("/history", getHistory);

// GET /api/portfolio/:id  — full portfolio including html
router.get("/:id", getOne);

// PUT /api/portfolio/:id  — update html or templateName
router.put("/:id", update);

// DELETE /api/portfolio/:id
router.delete("/:id", remove);

module.exports = router;
