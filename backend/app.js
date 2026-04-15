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

// Security headers
app.use(helmet());

// CORS — dev defaults allow both Vite ports; set ALLOWED_ORIGINS in prod
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

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Global rate limiter
app.use(globalRateLimiter);

// Health check — does NOT call Gemini, burns zero quota
app.get("/health", (_req, res) =>
  res.json({
    status:    "ok",
    project:   "AI Portfolio Maker",
    timestamp: new Date().toISOString(),
  })
);

// Gemini key status — shows which keys are loaded, zero API calls made
// Usage: curl http://localhost:5000/health/gemini
app.get("/health/gemini", (_req, res) => {
  const keyEnvVars = [
    "GEMINI_API_KEY",
    "GEMINI_API_KEY_2",
    "GEMINI_API_KEY_3",
    "GEMINI_API_KEY_4",
    "GEMINI_API_KEY_5",
  ];

  const loaded = keyEnvVars
    .map((name) => ({ name, value: process.env[name] }))
    .filter(({ value }) => typeof value === "string" && value.trim().length > 10)
    .map(({ name, value }) => ({
      envVar:     name,
      keyPreview: `...${value.slice(-6)}`,
      configured: true,
    }));

  const missing = keyEnvVars
    .filter((name) => {
      const v = process.env[name];
      return !v || v.trim().length <= 10;
    })
    .map((name) => ({ envVar: name, configured: false }));

  res.json({
    keysConfigured: loaded.length,
    keys:           loaded,
    missingSlots:   missing,
    modelsInUse: [
      "gemini-1.5-flash  (primary  — 1500 RPD free, own quota pool)",
      "gemini-2.0-flash  (fallback — 1500 RPD free, separate quota pool)",
    ],
    note: "This endpoint makes no Gemini API calls. To verify a key, visit https://aistudio.google.com/app/prompts/new_chat",
    tip:
      loaded.length === 0
        ? "Add GEMINI_API_KEY=AIza... to backend/.env and restart."
        : `${loaded.length} key(s) configured. Each gets separate daily quota per model.`,
  });
});

// API routes
app.use("/api/auth",      authRoutes);
app.use("/api/portfolio", portfolioRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Central error handler (must be last)
app.use(errorHandler);

module.exports = app;
