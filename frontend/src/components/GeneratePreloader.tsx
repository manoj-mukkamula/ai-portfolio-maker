// src/components/GeneratePreloader.tsx
// Updated: larger font sizes, bigger icon, more prominent step text
// Phase 1 (0-10s): animated progress to ~97%
// Phase 2 (10s+): extended wait mode with live timer
// onComplete() fires at 10s mark; parent handles navigation

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
    message: "Selecting the best layout...",
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

const PARTICLES = [
  { x: 15, y: 20, size: 3, delay: 0,   dur: 4   },
  { x: 80, y: 15, size: 2, delay: 0.8, dur: 5   },
  { x: 70, y: 75, size: 4, delay: 1.5, dur: 3.5 },
  { x: 25, y: 70, size: 2, delay: 0.3, dur: 4.5 },
  { x: 90, y: 45, size: 3, delay: 2,   dur: 3   },
  { x: 10, y: 55, size: 2, delay: 1.2, dur: 5   },
  { x: 55, y: 10, size: 3, delay: 0.6, dur: 4   },
  { x: 40, y: 85, size: 2, delay: 1.8, dur: 4.5 },
  { x: 60, y: 30, size: 1, delay: 0.4, dur: 6   },
  { x: 30, y: 40, size: 2, delay: 2.2, dur: 3.5 },
  { x: 85, y: 65, size: 1, delay: 1,   dur: 5   },
  { x: 45, y: 55, size: 2, delay: 0.7, dur: 4.2 },
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
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes gpl-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes gpl-bar-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  .gpl-float { animation: gpl-float var(--dur, 4s) ease-in-out infinite; animation-delay: var(--delay, 0s); }
  .gpl-spin  { animation: gpl-spin-slow 8s linear infinite; }
  .gpl-spin-rev { animation: gpl-spin-rev 12s linear infinite; }
  .gpl-pulse-ring { animation: gpl-pulse-ring 2s ease-out infinite; }
  .gpl-fade-up { animation: gpl-fade-up 0.5s ease both; }
  .gpl-shimmer-text {
    background: linear-gradient(90deg, #6366f1 0%, #a78bfa 30%, #22d3ee 60%, #6366f1 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gpl-shimmer 2.8s linear infinite;
  }
  .gpl-bar-pulse { animation: gpl-bar-pulse 1.6s ease-in-out infinite; }
`;

interface Props {
  onComplete: () => void;
}

const NORMAL_DURATION_MS = 10_000;

const formatWait = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
};

const GeneratePreloader = ({ onComplete }: Props) => {
  const [stepIdx, setStepIdx]   = useState(0);
  const [progress, setProgress] = useState(0);
  const [extended, setExtended] = useState(false);
  const [waitSecs, setWaitSecs] = useState(0);

  const startRef      = useRef(Date.now());
  const rafRef        = useRef<number>(0);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef  = useRef(false);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const ratio   = Math.min(elapsed / NORMAL_DURATION_MS, 1);
      const eased   = 1 - Math.pow(1 - ratio, 2);
      const pct     = Math.round(eased * 97);
      setProgress(pct);

      let si = 0;
      for (let i = STEPS.length - 1; i >= 0; i--) {
        if (pct >= STEPS[i].pct) { si = i; break; }
      }
      setStepIdx(si);

      if (elapsed >= NORMAL_DURATION_MS) {
        setProgress(97);
        setStepIdx(STEPS.length - 1);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
        setExtended(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [onComplete]);

  useEffect(() => {
    if (!extended) return;
    const extendedStart = Date.now();
    timerRef.current = setInterval(() => {
      setWaitSecs(Math.floor((Date.now() - extendedStart) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [extended]);

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
              width: 700, height: 700,
              top: "-20%", left: "-15%",
              background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 600, height: 600,
              bottom: "-15%", right: "-10%",
              background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 400, height: 400,
              top: "30%", right: "20%",
              background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
              filter: "blur(60px)",
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

        {/* Central animated icon — larger */}
        <div className="relative mb-12">
          <div
            className="absolute inset-0 rounded-full gpl-pulse-ring"
            style={{
              background: "transparent",
              border: "2px solid rgba(99,102,241,0.5)",
            }}
          />
          <div
            className="gpl-spin rounded-full"
            style={{
              width: 110, height: 110,
              background: "transparent",
              border: "2px dashed rgba(99,102,241,0.25)",
            }}
          />
          <div
            className="absolute gpl-spin-rev rounded-full"
            style={{
              width: 84, height: 84,
              top: 13, left: 13,
              background: "transparent",
              border: "1.5px solid rgba(139,92,246,0.3)",
            }}
          />
          <div
            className="absolute flex items-center justify-center rounded-full"
            style={{
              width: 60, height: 60,
              top: 25, left: 25,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)",
              boxShadow: "0 0 40px rgba(99,102,241,0.7), 0 0 80px rgba(99,102,241,0.3)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2 0V4.07c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93z"
                fill="rgba(255,255,255,0.92)" />
            </svg>
          </div>
        </div>

        {/* Step text — larger fonts */}
        <div className="text-center max-w-lg px-8 mb-12">
          {!extended ? (
            <>
              <p
                key={stepIdx}
                className="gpl-fade-up text-xs tracking-[0.25em] uppercase font-semibold mb-4"
                style={{ color: "rgba(167,139,250,0.9)" }}
              >
                {step.phase}
              </p>
              <h2
                key={`msg-${stepIdx}`}
                className="gpl-fade-up gpl-shimmer-text text-2xl sm:text-3xl font-bold mb-3 leading-tight"
              >
                {step.message}
              </h2>
              <p
                key={`sub-${stepIdx}`}
                className="gpl-fade-up text-base"
                style={{ color: "rgba(148,163,184,0.65)", animationDelay: "0.12s" }}
              >
                {step.sub}
              </p>
            </>
          ) : (
            <>
              <p
                className="gpl-fade-up text-xs tracking-[0.25em] uppercase font-semibold mb-4"
                style={{ color: "rgba(167,139,250,0.9)" }}
              >
                Gemini is processing
              </p>
              <h2 className="gpl-shimmer-text text-2xl sm:text-3xl font-bold mb-3 leading-tight">
                Waiting for AI response...
              </h2>
              <p className="text-base" style={{ color: "rgba(148,163,184,0.65)" }}>
                {waitSecs > 0
                  ? `Still working — ${formatWait(waitSecs)} elapsed. Gemini may be retrying due to rate limits.`
                  : "Sending request to Gemini AI..."}
              </p>
            </>
          )}
        </div>

        {/* Progress bar — wider */}
        <div className="w-full max-w-sm px-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2 items-center">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#6366f1" }}
              />
              <span className="text-sm font-medium" style={{ color: "rgba(148,163,184,0.7)" }}>
                {extended ? "Processing" : "Generating"}
              </span>
            </div>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: "rgba(99,102,241,0.95)" }}
            >
              {progress}%
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${extended ? "gpl-bar-pulse" : ""}`}
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)",
                boxShadow: "0 0 10px rgba(99,102,241,0.65)",
              }}
            />
          </div>
        </div>

        {/* Step dots */}
        <div className="flex gap-2.5 mt-7">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width:  i === stepIdx ? 24 : 7,
                height: 7,
                background:
                  i < stepIdx
                    ? "rgba(34,197,94,0.75)"
                    : i === stepIdx
                    ? "rgba(99,102,241,0.95)"
                    : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
        </div>

        {extended && waitSecs > 5 && (
          <p
            className="gpl-fade-up mt-6 text-xs text-center max-w-xs px-6"
            style={{ color: "rgba(148,163,184,0.45)" }}
          >
            Free tier limits may cause brief delays. Your portfolio is on its way.
          </p>
        )}

        <p
          className="absolute bottom-7 text-xs tracking-[0.15em] uppercase"
          style={{ color: "rgba(148,163,184,0.3)" }}
        >
          Powered by Google Gemini AI
        </p>
      </div>
    </>
  );
};

export default GeneratePreloader;
