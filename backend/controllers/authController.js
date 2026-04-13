// backend/controllers/authController.js
// Added: deleteAccount — verifies password, deletes all portfolios, then deletes user

const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors.map((e) => e.message).join(". ") });
    }
    const { name, email, password } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: "An account with this email already exists." });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({
      success: true, message: "Account created successfully.", token,
      user: { id: user._id, name: user.name, email: user.email, credits: user.credits, creditsLastReset: user.creditsLastReset },
    });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors.map((e) => e.message).join(". ") });
    }
    const { email, password } = parsed.data;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    await user.resetCreditsIfNeeded();
    const token = signToken(user._id);
    res.status(200).json({
      success: true, message: "Logged in successfully.", token,
      user: { id: user._id, name: user.name, email: user.email, credits: user.credits, creditsLastReset: user.creditsLastReset },
    });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    await user.resetCreditsIfNeeded();
    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, credits: user.credits, creditsLastReset: user.creditsLastReset },
    });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/auth/account
 * Verifies password, then deletes all portfolios + user account
 */
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required to delete your account." });
    }
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password. Account not deleted." });
    }

    await Portfolio.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: "Your account and all associated data have been permanently deleted.",
    });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, deleteAccount };
