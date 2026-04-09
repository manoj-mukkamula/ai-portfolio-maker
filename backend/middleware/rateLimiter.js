// middleware/rateLimiter.js — Rate limiting
// Two limiters: a global one for all routes, and a strict one for
// auth routes to prevent brute-force attacks.

const rateLimit = require("express-rate-limit");

// ── Applied to every request
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },
});

// ── Applied only to /api/auth/* routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 login/register attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again after 15 minutes.",
  },
});

// ── Applied only to /api/portfolio/generate (expensive AI call)
const generateRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,                   // max 10 generation requests per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Generation limit reached. Please try again after an hour.",
  },
});

module.exports = { globalRateLimiter, authRateLimiter, generateRateLimiter };
