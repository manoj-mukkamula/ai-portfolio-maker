// config/db.js — MongoDB connection
// Uses Mongoose to connect. Called once at startup in server.js.

const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not defined in .env");

  await mongoose.connect(uri, {
    // These options silence deprecation warnings in Mongoose 6+
    serverSelectionTimeoutMS: 5000, // Fail fast if DB unreachable
  });

  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected");
  });
};

module.exports = connectDB;
