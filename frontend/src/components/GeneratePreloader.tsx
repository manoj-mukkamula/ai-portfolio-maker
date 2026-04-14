// src/components/GeneratePreloader.tsx
// Premium 10-second preloader shown before portfolio generation.
// Deep-space palette, smooth step transitions, deterministic particles.

import { useEffect, useState, useRef } from "react";

const STEPS = [
  {
    phase: "Reading resume",
    message: "Parsing your resume file...",
    sub: "Extracting text, structure, and formatting",
    pct: 12,
  },
  {
    phase: "Understanding profile",
    message: "Identifying skills and experience...",
    sub: "Gemini AI is processing your professional history",
    pct: 28,
  },
  {
    phase: "Analysing content",
    message: "Mapping projects and achievements...",
    sub: "Building a structured profile from your data",
    pct: 46,
  },
  {
    phase: "Designing layout",
    message: "Selecting the best layout for your template...",
    sub: "Applying your chosen design style",
    pct: 62,
  },
  {
    phase: "Writing content",
    message: "Crafting compelling portfolio copy...",
    sub: "AI is writing professional descriptions for each section",
    pct: 76,
  },
  {
    phase: "Building portfolio",
    message: "Assembling your portfolio page...",
    sub: "Stitching together HTML, styles, and content",
    pct: 89,
  },
  {
    phase: "Finishing up",
    message: "Applying final polish...",
    sub: "Almost there — just a few more seconds",
    pct: 97,
  },
];

// Deterministic particles (no Math.random on render — prevents flicker)
const PARTICLES = [
  { x: 15, y: 20, size: 3, delay: 0,    dur: 4   },
  { x: 80, y: 15, size: 2, delay: 0.8,  dur: 5   },
  { x: 70, y: 75, size: 4, delay: 1.5,  dur: 3.5 },
  { x: 25, y: 70, size: 2, delay: 0.3,  dur: 4.5 },
  { x: 90, y: 45, size: 3, delay: 2,    dur: 3   },
  { x: 10, y: 55, size: 2, delay: 1.2,  dur: 5   },
  { x: 55, y: 10, size: 3, delay: 0.6,  dur: 4   },
  { x: 40, y: 85, size: 2, delay: 1.8,  dur: 4.5 },
  { x: 60, y: 30, size: 1, delay: 0.4,  dur: 6   },
  { x: 30, y: 40, size: 2, delay: 2.2,  dur: 3.5 },
  { x: 85, y: 65, size: 1, delay: 1,    dur: 5   },
  { x: 45, y: 55, size: 2, delay: 0.7,  dur: 4.2 },
];

const CSS = `
  @keyframes gpl-float {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
    50%       { transform: translateY(-18px) scale(1.15); opacity: 1; }
  }
  @keyframes gpl-spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes gpl-spin-rev {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  @keyframes gpl-pulse-ring {
    0%   { transform: scale(0.85); opacity: 0.7; }
    70%  { transform: scale(1.25); opacity: 0; }
    100% { transform: scale(0.85); opacity: 0; }
  }
  @keyframes gpl-fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes gpl-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .gpl-float { animation: gpl-float var(--dur, 4s) ease-in-out infinite; animation-delay: var(--delay, 0s); }
  .gpl-spin  { animation: gpl-spin-slow 8s linear infinite; }
  .gpl-spin-rev { animation: gpl-spin-rev 12s linear infinite; }
  .gpl-pulse-ring { animation: gpl-pulse-ring 2s ease-out infinite; }
  .gpl-fade-up { animation: gpl-fade-up 0.45s ease both; }
  .gpl-shimmer-text {
    background: linear-gradient(90deg, #6366f1 0%, #a78bfa 30%, #22d3ee 60%, #6366f1 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gpl-shimmer 2.8s linear infinite;
  }
`;

interface Props {
  onComplete: () => void;
}

const TOTAL_DURATION_MS = 10_000;

const GeneratePreloader = ({ onComplete }: Props) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(Date.now());
  const rafRef = useRef<number>(0);
  const completedRef = useRef(false);

  // Smooth progress animation via rAF
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const ratio = Math.min(elapsed / TOTAL_DURATION_MS, 1);
      // Ease-out curve so progress slows near the end (feels anticipatory)
      const easedRatio = 1 - Math.pow(1 - ratio, 2);
      const pct = Math.round(easedRatio * 97); // never reaches 100 until done
      setProgress(pct);

      // Advance step index based on progress
      let si = 0;
      for (let i = STEPS.length - 1; i >= 0; i--) {
        if (pct >= STEPS[i].pct) { si = i; break; }
      }
      setStepIdx(si);

      if (elapsed >= TOTAL_DURATION_MS) {
        if (!completedRef.current) {
          completedRef.current = true;
          setProgress(97);
          onComplete();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [onComplete]);

  const step = STEPS[stepIdx];

  return (
    <>
      <style>{CSS}</style>
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
        style={{
          background: "radial-gradient(ellipse at 60% 40%, #0f0a2e 0%, #060a12 55%, #000 100%)",
        }}
      >
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              width: 600, height: 600,
              top: "-20%", left: "-15%",
              background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 500, height: 500,
              bottom: "-15%", right: "-10%",
              background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 300, height: 300,
              top: "30%", right: "20%",
              background: "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full gpl-float"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: i % 3 === 0 ? "#6366f1" : i % 3 === 1 ? "#a78bfa" : "#22d3ee",
              opacity: 0.5,
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
            } as React.CSSProperties}
          />
        ))}

        {/* Central animated icon */}
        <div className="relative mb-10">
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full gpl-pulse-ring"
            style={{
              background: "transparent",
              border: "2px solid rgba(99,102,241,0.5)",
            }}
          />
          {/* Outer spinning ring */}
          <div
            className="gpl-spin rounded-full"
            style={{
              width: 88, height: 88,
              background: "transparent",
              border: "2px dashed rgba(99,102,241,0.25)",
            }}
          />
          {/* Inner counter-spinning ring */}
          <div
            className="absolute gpl-spin-rev rounded-full"
            style={{
              width: 66, height: 66,
              top: 11, left: 11,
              background: "transparent",
              border: "1.5px solid rgba(139,92,246,0.3)",
            }}
          />
          {/* Core */}
          <div
            className="absolute flex items-center justify-center rounded-full"
            style={{
              width: 48, height: 48,
              top: 20, left: 20,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)",
              boxShadow: "0 0 32px rgba(99,102,241,0.6), 0 0 64px rgba(99,102,241,0.25)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2 0V4.07c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93z"
                fill="rgba(255,255,255,0.9)" />
            </svg>
          </div>
        </div>

        {/* Step text */}
        <div className="text-center max-w-sm px-6 mb-10">
          <p
            key={stepIdx}
            className="gpl-fade-up text-[11px] tracking-[0.2em] uppercase font-semibold mb-3"
            style={{ color: "rgba(167,139,250,0.8)" }}
          >
            {step.phase}
          </p>
          <h2
            key={`msg-${stepIdx}`}
            className="gpl-fade-up gpl-shimmer-text text-xl sm:text-2xl font-bold mb-2 leading-tight"
          >
            {step.message}
          </h2>
          <p
            key={`sub-${stepIdx}`}
            className="gpl-fade-up text-sm"
            style={{ color: "rgba(148,163,184,0.55)", animationDelay: "0.1s" }}
          >
            {step.sub}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs px-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1.5 items-center">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#6366f1" }}
              />
              <span className="text-[11px] font-medium" style={{ color: "rgba(148,163,184,0.6)" }}>
                Generating
              </span>
            </div>
            <span
              className="text-[11px] font-bold tabular-nums"
              style={{ color: "rgba(99,102,241,0.9)" }}
            >
              {progress}%
            </span>
          </div>
          <div
            className="w-full h-1 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)",
                boxShadow: "0 0 8px rgba(99,102,241,0.6)",
              }}
            />
          </div>
        </div>

        {/* Step dots */}
        <div className="flex gap-2 mt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === stepIdx ? 20 : 6,
                height: 6,
                background: i < stepIdx
                  ? "rgba(34,197,94,0.7)"
                  : i === stepIdx
                  ? "rgba(99,102,241,0.9)"
                  : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
        </div>

        {/* Bottom credit */}
        <p
          className="absolute bottom-6 text-[10px] tracking-[0.15em] uppercase"
          style={{ color: "rgba(148,163,184,0.25)" }}
        >
          Powered by Google Gemini AI
        </p>
      </div>
    </>
  );
};

export default GeneratePreloader;
