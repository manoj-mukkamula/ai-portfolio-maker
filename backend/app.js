// app.js — Express application setup
// Configures security, CORS, body parsing, rate limiting, and API routes.

const express   = require("express");
const helmet    = require("helmet");
const cors      = require("cors");
const { globalRateLimiter } = require("./middleware/rateLimiter");
const errorHandler           = require("./middleware/errorHandler");

const authRoutes      = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");

const app = express();

// ── Security headers (XSS, clickjacking, MIME sniffing, etc.) ──────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────────────────────────
// Default development origins: Vite dev server (8080 or 5173).
// In production set ALLOWED_ORIGINS env var to your deployed frontend URL.
const defaultOrigins = [
  "http://localhost:8080",   // Vite configured port in this project
  "http://localhost:5173",   // Vite default fallback
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server (no origin) and Postman / curl testing
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin "${origin}" is not allowed`));
      }
    },
    credentials: true,
  })
);

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Global rate limiter ────────────────────────────────────────────────────
app.use(globalRateLimiter);

// ── Health check ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", project: "AI Portfolio Maker", timestamp: new Date().toISOString() })
);

// ── API routes ─────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/portfolio", portfolioRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Central error handler (must be last middleware) ────────────────────────
app.use(errorHandler);

module.exports = app;