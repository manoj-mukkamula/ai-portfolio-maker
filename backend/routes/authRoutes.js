// routes/authRoutes.js — Auth endpoints
// /api/auth/register, /api/auth/login, /api/auth/me

const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Auth-specific rate limiter applied to register + login only
router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);

// Protected route — requires valid JWT
router.get("/me", protect, getMe);

module.exports = router;
