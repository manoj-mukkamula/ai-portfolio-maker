// backend/server.js
// require("dotenv").config() must be the very first line — before any other require().
// This ensures process.env is fully populated before any module reads from it.

require("dotenv").config();

const geminiKeys = [
  ["GEMINI_API_KEY",   process.env.GEMINI_API_KEY],
  ["GEMINI_API_KEY_2", process.env.GEMINI_API_KEY_2],
  ["GEMINI_API_KEY_3", process.env.GEMINI_API_KEY_3],
  ["GEMINI_API_KEY_4", process.env.GEMINI_API_KEY_4],
  ["GEMINI_API_KEY_5", process.env.GEMINI_API_KEY_5],
];

const loadedKeys = geminiKeys.filter(([, v]) => typeof v === "string" && v.trim().length > 10);

console.log("─".repeat(60));
console.log("AI Portfolio Maker — Environment Check");
console.log("─".repeat(60));
console.log("  NODE_ENV   :", process.env.NODE_ENV || "(not set, defaults to development)");
console.log("  PORT       :", process.env.PORT     || "(not set, defaults to 5000)");
console.log("  MONGO_URI  :", process.env.MONGO_URI  ? "✅ loaded" : "❌ MISSING");
console.log("  JWT_SECRET :", process.env.JWT_SECRET ? "✅ loaded" : "❌ MISSING");
console.log("");

if (loadedKeys.length === 0) {
  console.log("  Gemini Keys: ❌ NONE FOUND");
} else {
  loadedKeys.forEach(([name, val]) => {
    console.log(`  ${name.padEnd(16)}: ✅ loaded (ends ...${val.slice(-6)})`);
  });
  const skipped = geminiKeys.filter(([, v]) => !v);
  skipped.forEach(([name]) => {
    console.log(`  ${name.padEnd(16)}: — not set (optional backup)`);
  });
  console.log("");
  console.log("  Models in use (free tier, India):");
  console.log("    1. gemini-1.5-flash  — primary,  1500 req/day, own quota");
  console.log("    2. gemini-2.0-flash  — fallback, 1500 req/day, separate quota");
  console.log("  RPM throttle (429): waits 62s and retries automatically.");
  console.log("  Daily quota (429):  tries next model, then next key.");
}

console.log("─".repeat(60));

if (loadedKeys.length === 0) {
  console.error(
    "\n❌ CRITICAL: No Gemini API key is configured.\n" +
      "  Portfolio generation will fail on every request.\n" +
      "  Fix: Add GEMINI_API_KEY=AIza... to backend/.env then restart.\n" +
      "  Get a free key at https://aistudio.google.com/app/apikey\n"
  );
}

if (!process.env.MONGO_URI) {
  console.error(
    "\n❌ CRITICAL: MONGO_URI is not set.\n" +
      "  The server cannot connect to MongoDB.\n" +
      "  Fix: Add MONGO_URI=mongodb+srv://... to backend/.env then restart.\n"
  );
}

const app       = require("./app");
const connectDB = require("./config/db");

const PORT = parseInt(process.env.PORT || "5000", 10);

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n✅ Server running at http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   Key status:   http://localhost:${PORT}/health/gemini\n`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
})();
