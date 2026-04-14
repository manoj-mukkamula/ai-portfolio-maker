// backend/app.js
// Express application setup.
// Configures security, CORS, body parsing, rate limiting, and API routes.

const express   = require("express");
const helmet    = require("helmet");
const cors      = require("cors");
const { globalRateLimiter } = require("./middleware/rateLimiter");
const errorHandler           = require("./middleware/errorHandler");

const authRoutes      = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");

const app = express();

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────────────────────
// Development defaults: Vite dev server on 8080 or 5173.
// Production: set ALLOWED_ORIGINS env var to your deployed frontend URL.
const defaultOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin "${origin}" is not allowed`));
      }
    },
    credentials: true,
  })
);

// ── Body parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Global rate limiter ─────────────────────────────────────────────────────
app.use(globalRateLimiter);

// ── Health check ────────────────────────────────────────────────────────────
// Simple liveness probe — does NOT call Gemini (no quota burned).
app.get("/health", (_req, res) =>
  res.json({
    status: "ok",
    project: "AI Portfolio Maker",
    timestamp: new Date().toISOString(),
  })
);

// ── Gemini key status endpoint ──────────────────────────────────────────────
// GET /health/gemini
// Returns which keys are configured and their key previews.
// Does NOT make any Gemini API calls — zero quota consumed.
//
// If you need to verify a key works, test it directly in Google AI Studio:
//   https://aistudio.google.com/app/prompts/new_chat
//
// Example: curl http://localhost:5000/health/gemini
app.get("/health/gemini", (_req, res) => {
  const keyEnvVars = [
    "GEMINI_API_KEY",
    "GEMINI_API_KEY_2",
    "GEMINI_API_KEY_3",
    "GEMINI_API_KEY_4",
    "GEMINI_API_KEY_5",
  ];

  const keys = keyEnvVars
    .map((name) => ({ name, value: process.env[name] }))
    .filter(({ value }) => typeof value === "string" && value.trim().length > 10)
    .map(({ name, value }) => ({
      envVar: name,
      keyPreview: `...${value.slice(-6)}`,
      configured: true,
    }));

  const missing = keyEnvVars
    .filter((name) => {
      const v = process.env[name];
      return !v || v.trim().length <= 10;
    })
    .map((name) => ({ envVar: name, configured: false }));

  const modelsInUse = [
    "gemini-2.0-flash-lite  (primary — separate quota pool)",
    "gemini-2.0-flash       (fallback — if lite quota exhausted)",
  ];

  res.json({
    keysConfigured: keys.length,
    keys,
    missingSlots: missing,
    modelsInUse,
    note: "This endpoint no longer calls Gemini to avoid burning free-tier quota. To test a key, visit https://aistudio.google.com/app/prompts/new_chat",
    tip: keys.length === 0
      ? "Add GEMINI_API_KEY=AIza... to backend/.env and restart the server."
      : `You have ${keys.length} key(s) configured. Each key gets separate daily quota per model.`,
  });
});

// ── API routes ──────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/portfolio", portfolioRoutes);

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Central error handler (must be last) ────────────────────────────────────
app.use(errorHandler);

module.exports = app;
