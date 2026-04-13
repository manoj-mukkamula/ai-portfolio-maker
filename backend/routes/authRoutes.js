// backend/routes/authRoutes.js
// Added: DELETE /account for account deletion

const express = require("express");
const { register, login, getMe, deleteAccount } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/register", authRateLimiter, register);
router.post("/login",    authRateLimiter, login);
router.get("/me",        protect, getMe);
router.delete("/account", protect, deleteAccount);

module.exports = router;
