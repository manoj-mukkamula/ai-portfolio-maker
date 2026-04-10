// backend/server.js
// require("dotenv").config() must be the absolute first line.
// Every other require() comes after so that process.env is fully populated
// before any module reads from it.

require("dotenv").config();

// Print a clear summary of what loaded from .env so you can catch
// missing values before the first request ever arrives.
console.log("--------------------------------------------------");
console.log("Environment Check");
console.log(
  "  NODE_ENV         :",
  process.env.NODE_ENV || "(not set, defaults to development)"
);
console.log(
  "  PORT             :",
  process.env.PORT || "(not set, defaults to 5000)"
);
console.log(
  "  MONGO_URI        :",
  process.env.MONGO_URI ? "loaded" : "MISSING"
);
console.log(
  "  JWT_SECRET       :",
  process.env.JWT_SECRET ? "loaded" : "MISSING"
);
console.log(
  "  GEMINI_API_KEY   :",
  process.env.GEMINI_API_KEY
    ? `loaded (ends with ...${process.env.GEMINI_API_KEY.slice(-6)})`
    : "MISSING"
);
console.log(
  "  GEMINI_API_KEY_2 :",
  process.env.GEMINI_API_KEY_2
    ? `loaded (ends with ...${process.env.GEMINI_API_KEY_2.slice(-6)})`
    : "not set (optional backup key)"
);
console.log(
  "  GEMINI_API_KEY_3 :",
  process.env.GEMINI_API_KEY_3
    ? `loaded (ends with ...${process.env.GEMINI_API_KEY_3.slice(-6)})`
    : "not set (optional backup key)"
);
console.log("--------------------------------------------------");

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "CRITICAL: GEMINI_API_KEY is not set. Portfolio generation will fail.\n" +
      "Fix: add GEMINI_API_KEY=AIza... to backend/.env then restart the server.\n" +
      "Get a free key at https://aistudio.google.com/app/apikey"
  );
}

if (!process.env.MONGO_URI) {
  console.error(
    "CRITICAL: MONGO_URI is not set. The server cannot connect to MongoDB.\n" +
      "Fix: add MONGO_URI=mongodb+srv://... to backend/.env then restart."
  );
}

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
})();