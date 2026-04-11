// src/components/SplashScreen.tsx
//
// A full-screen loading screen shown for ~2 seconds when the app first starts.
// Uses only CSS animations and Framer Motion (already in package.json).
// No external dependencies added. No routing logic changed.
//
// Design: deep navy background, animated gradient orbs, typewriter brand name,
// rotating ring, progress bar, and a subtle "Developed by Manoj" credit line.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

const DURATION_MS = 2200;

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Drive the progress bar smoothly over DURATION_MS
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min((elapsed / DURATION_MS) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    // After the duration, fade out then call onComplete
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500); // wait for exit animation to finish
    }, DURATION_MS);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0b0f1a 0%, #111827 50%, #0d1424 100%)" }}
        >
          {/* Background orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full"
              style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.18, 0.1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
              style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full"
              style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
            />
          </div>

          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Centre content */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">

            {/* Animated logo ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="relative"
            >
              {/* Outer spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full absolute inset-0"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 70%, #3b82f6 85%, #8b5cf6 100%)",
                }}
              />
              {/* Inner ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full absolute inset-0 p-1"
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 180deg, transparent 75%, #06b6d4 90%, #8b5cf6 100%)",
                  }}
                />
              </motion.div>
              {/* Icon box */}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)",
                  border: "2px solid rgba(59,130,246,0.3)",
                }}
              >
                {/* CPU / Portfolio icon made of spans */}
                <div className="flex flex-col gap-[3px]">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4 + i * 0.08, duration: 0.3 }}
                      className="h-[3px] rounded-full"
                      style={{
                        width: [28, 20, 24, 16][i],
                        background: `linear-gradient(90deg, #3b82f6, #8b5cf6)`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Brand name */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
            >
              <h1
                className="text-4xl sm:text-5xl font-bold tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #e0e7ff 0%, #93c5fd 40%, #c4b5fd 80%, #e0e7ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.02em",
                }}
              >
                AI Portfolio
              </h1>
              <h2
                className="text-4xl sm:text-5xl font-bold tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #93c5fd 0%, #c4b5fd 60%, #67e8f9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.02em",
                }}
              >
                Maker
              </h2>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-sm font-medium tracking-[0.25em] uppercase"
              style={{ color: "rgba(148,163,184,0.8)" }}
            >
              Powered by Google Gemini AI
            </motion.p>

            {/* Floating skill chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-2 max-w-xs"
            >
              {["Resume", "AI", "Portfolio", "Export", "Templates"].map((chip, i) => (
                <motion.span
                  key={chip}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 + i * 0.07, duration: 0.3 }}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase"
                  style={{
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    color: "#93c5fd",
                  }}
                >
                  {chip}
                </motion.span>
              ))}
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-64 sm:w-80"
            >
              <div
                className="h-[3px] rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)",
                  }}
                />
              </div>
              <p
                className="text-[11px] mt-2 tracking-widest text-center"
                style={{ color: "rgba(148,163,184,0.5)" }}
              >
                {progress < 40
                  ? "Initialising..."
                  : progress < 80
                  ? "Loading templates..."
                  : "Almost ready..."}
              </p>
            </motion.div>

            {/* Developed by */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex items-center gap-2 text-xs"
              style={{ color: "rgba(148,163,184,0.4)" }}
            >
              <span
                className="w-8 h-px"
                style={{ background: "rgba(148,163,184,0.2)" }}
              />
              Developed by{" "}
              <span
                className="font-semibold"
                style={{ color: "rgba(196,181,253,0.7)" }}
              >
                Manoj
              </span>
              <span
                className="w-8 h-px"
                style={{ background: "rgba(148,163,184,0.2)" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
