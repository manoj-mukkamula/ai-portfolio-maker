// src/components/SplashScreen.tsx
// Duration reduced by 1 second: 3500ms -> 2500ms
// Design and logic unchanged.

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

const DURATION_MS = 2500;

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  size: i % 3 === 0 ? 2 : 1.2,
  delay: (i * 0.18) % 2.4,
  duration: 2.5 + (i % 4) * 0.6,
}));

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadText, setLoadText] = useState("Initialising...");
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();

    const tick = (now: number) => {
      const pct = Math.min(((now - start) / DURATION_MS) * 100, 100);
      setProgress(pct);
      if (pct < 38) setLoadText("Initialising...");
      else if (pct < 72) setLoadText("Loading templates...");
      else setLoadText("Almost ready...");
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, DURATION_MS);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #080c18 0%, #0e1525 45%, #0a1020 100%)" }}
        >
          {/* Ambient orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.1, 0.18, 0.1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] rounded-full"
              style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 68%)" }}
            />
            <motion.div
              animate={{ scale: [1, 1.22, 1], opacity: [0.08, 0.15, 0.08] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[-25%] right-[-15%] w-[700px] h-[700px] rounded-full"
              style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 68%)" }}
            />
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.05, 0.11, 0.05] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
              className="absolute top-[35%] right-[20%] w-[350px] h-[350px] rounded-full"
              style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 68%)" }}
            />
          </div>

          {/* Fine grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Star particles */}
          <div className="absolute inset-0 pointer-events-none">
            {PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-white"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                animate={{ opacity: [0, 0.55, 0] }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>

          {/* Centre content */}
          <div className="relative z-10 flex flex-col items-center gap-7 px-6 text-center">

            {/* Logo ring */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="relative w-28 h-28"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{ background: "conic-gradient(from 0deg, transparent 60%, #6366f1 80%, #8b5cf6 90%, #06b6d4 100%)" }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[3px] rounded-full"
                style={{ background: "conic-gradient(from 90deg, transparent 65%, #0ea5e9 85%, #6366f1 100%)" }}
              />
              <div
                className="absolute inset-[6px] rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, #1a1f3c 0%, #12172e 100%)",
                  border: "1px solid rgba(99,102,241,0.25)",
                }}
              >
                <div className="flex flex-col gap-[4px] items-start px-1">
                  {[32, 22, 28, 18].map((w, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ delay: 0.35 + i * 0.08, duration: 0.3, ease: "easeOut" }}
                      style={{
                        width: w, height: 3, borderRadius: 2,
                        background: "linear-gradient(90deg, #6366f1, #a78bfa)",
                        transformOrigin: "left",
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Brand name — single line */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.55, ease: "easeOut" }}
              className="flex flex-col items-center gap-2"
            >
              <h1
                className="text-4xl sm:text-5xl font-extrabold tracking-tight whitespace-nowrap"
                style={{
                  background: "linear-gradient(110deg, #c7d2fe 0%, #818cf8 30%, #a78bfa 60%, #67e8f9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.03em",
                }}
              >
                AI Portfolio Maker
              </h1>
              <div className="flex items-center gap-2" style={{ color: "rgba(148,163,184,0.55)" }}>
                <span className="w-10 h-px" style={{ background: "rgba(99,102,241,0.35)" }} />
                <span className="text-xs tracking-[0.22em] uppercase font-medium">
                  Powered by Google Gemini
                </span>
                <span className="w-10 h-px" style={{ background: "rgba(99,102,241,0.35)" }} />
              </div>
            </motion.div>

            {/* Feature chips */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.45 }}
              className="flex flex-wrap justify-center gap-2 max-w-sm"
            >
              {["Resume", "AI Extract", "Portfolio", "Templates", "Export"].map((chip, i) => (
                <motion.span
                  key={chip}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.68 + i * 0.07, duration: 0.28 }}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase"
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.22)",
                    color: "#a5b4fc",
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
              transition={{ delay: 0.45 }}
              className="w-72 sm:w-96"
            >
              <div
                className="h-[3px] rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #6366f1, #8b5cf6, #0ea5e9)",
                  }}
                />
              </div>
              <p
                className="text-[11px] mt-2 text-center tracking-[0.2em] uppercase"
                style={{ color: "rgba(148,163,184,0.45)" }}
              >
                {loadText}
              </p>
            </motion.div>

            {/* Credit */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex items-center gap-2 text-xs"
              style={{ color: "rgba(148,163,184,0.35)" }}
            >
              <span className="w-6 h-px" style={{ background: "rgba(148,163,184,0.15)" }} />
              Developed by{" "}
              <span style={{ color: "rgba(167,139,250,0.65)", fontWeight: 700 }}>Manoj</span>
              <span className="w-6 h-px" style={{ background: "rgba(148,163,184,0.15)" }} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;