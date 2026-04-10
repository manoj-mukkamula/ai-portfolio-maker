// backend/server.js
//
// FIX: Added startup diagnostics so you can see EXACTLY what's loaded from .env.
// require("dotenv").config() MUST stay as the absolute FIRST line.

require("dotenv").config();

// ── Startup diagnostics — run BEFORE importing app (which loads geminiService)
console.log("─────────────────────────────────────────");
console.log("🔧  Environment Check");
console.log(`   NODE_ENV        : ${process.env.NODE_ENV || "(not set) → defaults to development"}`);
console.log(`   PORT            : ${process.env.PORT || "(not set) → defaults to 5000"}`);
console.log(`   MONGO_URI       : ${process.env.MONGO_URI ? "✅ loaded" : "❌ MISSING"}`);
console.log(`   JWT_SECRET      : ${process.env.JWT_SECRET ? "✅ loaded" : "❌ MISSING"}`);
console.log(`   GEMINI_API_KEY  : ${process.env.GEMINI_API_KEY ? `✅ loaded (...${process.env.GEMINI_API_KEY.slice(-6)})` : "❌ MISSING"}`);
console.log(`   GEMINI_API_KEY_2: ${process.env.GEMINI_API_KEY_2 ? `✅ loaded (...${process.env.GEMINI_API_KEY_2.slice(-6)})` : "(not set — optional fallback)"}`);
console.log("─────────────────────────────────────────");

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "\n❌  CRITICAL: GEMINI_API_KEY is not set.\n" +
    "   Portfolio generation will fail for every request.\n" +
    "   Fix: Add GEMINI_API_KEY=AIza... to backend/.env and restart.\n" +
    "   Get a key: https://aistudio.google.com/app/apikey\n"
  );
}

if (!process.env.MONGO_URI) {
  console.error(
    "\n❌  CRITICAL: MONGO_URI is not set.\n" +
    "   The server cannot connect to MongoDB.\n" +
    "   Fix: Add MONGO_URI=mongodb+srv://... to backend/.env and restart.\n"
  );
}

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n✅  Server running → http://localhost:${PORT}`);
      console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
      console.log(`   Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (err) {
    console.error("❌  Failed to start server:", err.message);
    process.exit(1);
  }
})();