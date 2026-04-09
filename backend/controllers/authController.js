// controllers/authController.js — Auth logic
// Handles register and login. Passwords are hashed in the User model pre-save hook.

const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");

// ── Zod schemas for request body validation
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

/** Generates a signed JWT access token */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    // 1. Validate request body
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors.map((e) => e.message).join(". "),
      });
    }

    const { name, email, password } = parsed.data;

    // 2. Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // 3. Create user (password hashed via pre-save hook in User model)
    const user = await User.create({ name, email, password });

    // 4. Issue token
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    // 1. Validate request body
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors.map((e) => e.message).join(". "),
      });
    }

    const { email, password } = parsed.data;

    // 2. Find user — password field excluded by default, so force-select it
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      // Intentionally vague to prevent email enumeration
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 4. Issue token
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me  (optional — returns current user info)
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      credits: req.user.credits,
    },
  });
};

module.exports = { register, login, getMe };
