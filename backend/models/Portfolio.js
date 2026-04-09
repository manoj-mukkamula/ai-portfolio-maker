// models/Portfolio.js — Portfolio schema
// Stores the final generated HTML and the template name used.
// No structured JSON stored — Gemini fills the template directly.

const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Fast lookups by user
    },

    // The complete filled HTML returned by Gemini (ready to render in iframe)
    html: {
      type: String,
      required: [true, "Generated HTML is required"],
    },

    // Name/label of the template used (e.g. "modern", "minimal", "classic", "dark")
    // Free-form string — no enum restriction, supports custom templates
    templateName: {
      type: String,
      default: "custom",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);
