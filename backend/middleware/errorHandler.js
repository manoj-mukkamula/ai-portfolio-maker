// middleware/errorHandler.js — Central error handler
// Last middleware in app.js. Formats all errors into a consistent response.
// Never leaks stack traces or internal messages in production.

const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ── Mongoose: duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // ── Mongoose: validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
  }

  // ── Mongoose: bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── JWT errors (should be caught in authMiddleware, but just in case)
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only include stack trace during development
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
