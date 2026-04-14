// backend/app.js
// Express application setup.
// Configures security, CORS, body parsing, rate limiting, and API routes.

const express   = require("express");
const helmet    = require("helmet");
const cors      = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
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
app.get("/health", (_req, res) =>
  res.json({
    status: "ok",
    project: "AI Portfolio Maker",
    timestamp: new Date().toISOString(),
  })
);

// ── Gemini diagnostic endpoint ──────────────────────────────────────────────
// GET /health/gemini
// Tests every configured API key against every model in MODEL_PRIORITY.
// Returns a structured report so you can see exactly which key+model combos work.
// No authentication required — safe to call from curl or a browser.
//
// Example: curl http://localhost:5000/health/gemini
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-2.5-flash-preview-04-17",
];

app.get("/health/gemini", async (_req, res) => {
  const keyEnvVars = [
    "GEMINI_API_KEY",
    "GEMINI_API_KEY_2",
    "GEMINI_API_KEY_3",
    "GEMINI_API_KEY_4",
    "GEMINI_API_KEY_5",
  ];

  const keys = keyEnvVars
    .map((name) => ({ name, value: process.env[name] }))
    .filter(({ value }) => typeof value === "string" && value.trim().length > 10);

  if (keys.length === 0) {
    return res.status(503).json({
      ok: false,
      error: "No Gemini API keys configured in .env",
      fix: "Add GEMINI_API_KEY=AIza... to backend/.env and restart the server.",
    });
  }

  const results = [];

  for (const { name, value: apiKey } of keys) {
    const keyResult = {
      envVar: name,
      keyPreview: `...${apiKey.slice(-6)}`,
      models: [],
    };

    for (const model of GEMINI_MODELS) {
      const start = Date.now();
      try {
        const client = new GoogleGenerativeAI(apiKey);
        const m = client.getGenerativeModel({ model });
        // Use a minimal prompt to verify connectivity without burning tokens
        const result = await Promise.race([
          m.generateContent("Reply with just the word: ok"),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout after 15s")), 15000)
          ),
        ]);
        const text = result.response.text().trim().slice(0, 20);
        keyResult.models.push({
          model,
          status: "ok",
          responsePreview: text,
          latencyMs: Date.now() - start,
        });
      } catch (err) {
        const msg = (err?.message || "").toLowerCase();
        let errorType = "other";
        if (msg.includes("quota") || msg.includes("429") || msg.includes("resource_exhausted"))
          errorType = "quota_exceeded";
        else if (msg.includes("not found") || msg.includes("404") || msg.includes("model_not_found"))
          errorType = "model_not_found";
        else if (msg.includes("permission") || msg.includes("api key") || msg.includes("403"))
          errorType = "invalid_key";
        else if (msg.includes("timeout"))
          errorType = "timeout";

        keyResult.models.push({
          model,
          status: "error",
          errorType,
          errorMessage: (err?.message || "Unknown error").slice(0, 150),
          latencyMs: Date.now() - start,
        });
      }
    }

    const hasWorking = keyResult.models.some((m) => m.status === "ok");
    keyResult.hasWorkingModel = hasWorking;
    results.push(keyResult);
  }

  const anyWorking = results.some((r) => r.hasWorkingModel);

  res.status(anyWorking ? 200 : 503).json({
    ok: anyWorking,
    summary: anyWorking
      ? "At least one key and model combination is working."
      : "No working key/model combination found. Check your API keys and quota.",
    keysChecked: results.length,
    modelsChecked: GEMINI_MODELS,
    results,
    tip: "If all models show model_not_found, your key may be restricted to certain regions. Create a fresh key at https://aistudio.google.com/app/apikey and test it there first.",
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
