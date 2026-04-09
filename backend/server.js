// server.js
// ⚠️  require("dotenv").config() MUST be the FIRST LINE — before any other
//    require(). geminiService.js reads process.env.GEMINI_API_KEY at module
//    load time, so if dotenv runs after app.js is imported, the key is undefined.

require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Startup check — tells you immediately if the key is missing
if (!process.env.GEMINI_API_KEY) {
  console.error("❌  GEMINI_API_KEY is not set in .env — server will start but portfolio generation will fail.");
} else {
  console.log("✅  GEMINI_API_KEY loaded successfully.");
}

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅  Server running on http://localhost:${PORT} [${process.env.NODE_ENV || "development"}]`);
    });
  } catch (err) {
    console.error("❌  Failed to start server:", err.message);
    process.exit(1);
  }
})();