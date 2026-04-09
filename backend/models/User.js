// backend/models/User.js
//
// FIX: Changed from "5 credits total forever" to "5 credits per day".
// Uses a creditsLastReset timestamp — resets lazily at request time.
// No cron job needed. Works even across server restarts.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    credits: {
      type: Number,
      default: 5,
      min: [0, "Credits cannot be negative"],
    },
    // Tracks when the current 24h credit window started.
    // If now - creditsLastReset >= 24h → reset credits to 5.
    creditsLastReset: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ── Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare plain password with hash
userSchema.methods.matchPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

/**
 * Checks if 24 hours have passed since last credit reset.
 * If so, resets credits to 5 and saves.
 * Call this at the start of every portfolio generation request.
 *
 * @returns {User} - The user document (updated if reset occurred)
 */
userSchema.methods.resetCreditsIfNeeded = async function () {
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const msSinceReset = Date.now() - new Date(this.creditsLastReset).getTime();

  if (msSinceReset >= TWENTY_FOUR_HOURS_MS) {
    this.credits = 5;
    this.creditsLastReset = new Date();
    await this.save();
    console.log(`✅ Credits reset for user ${this.email} — new window started.`);
  }

  return this;
};

module.exports = mongoose.model("User", userSchema);