// src/components/GeneratePreloader.tsx
// Premium 10-second preloader shown before portfolio generation.
// Realistic step progression, deep-space color palette, floating particles.

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
    message: "Identifying your skills and experience...",
    sub: "Gemini AI is processing your professional history",
    pct: 28,
  },
  {
    phase: "Analysing content",
    message: "Mapping your projects and achievements...",
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

// Particle positions (deterministic, no Math.random on render)
const PARTICLES = [
  { x: 15, y: 20, size: 3, delay: 0,    dur: 4 },
  { x: 80, y: 15, size: 2, delay: 0.8,  dur: 5 },
  { x: 70, y: 75, size: 4, delay: 1.5,  dur: 3.5 },
  { x: 25, y: 70, size: 2, delay: 0.3,  dur: 4.5 },
  { x: 90, y: 45, size: 3, delay: 2,    dur: 3 },
  { x: 10, y: 55, size: 2, delay: 1.2,  dur: 5 },
  { x: 55, y: 10, size: 3, delay: 0.6,  dur: 4 },
  { x: 40, y: 85, size: 2, delay: 1.8,  dur: 4.5 },
  { x: 85, y: 60, size: 3, delay: 0.4,  dur: 3.5 },
  { x: 5,  y: 35, size: 2, delay: 2.2,  dur: 5 },
  { x: 60, y: 30, size: 2, delay: 1,    dur: 4 },
  { x: 35, y: 50, size: 3, delay: 2.5,  dur: 3 },
];

interface Props {
  onComplete: () => void;
}

const GeneratePreloader = ({ onComplete }: Props) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [displayPct, setDisplayPct] = useState(0);
  const [pulse, setPulse] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pctRef = useRef(0);
  const targetPctRef = useRef(STEPS[0].pct);

  const TOTAL_MS = 10000;
  const STEP_INTERVAL = Math.floor(TOTAL_MS / STEPS.length); // ~1428ms per step

  useEffect(() => {
    // Advance steps
    let idx = 0;
    const stepTimer = setInterval(() => {
      idx++;
      if (idx < STEPS.length) {
        setStepIndex(idx);
        targetPctRef.current = STEPS[idx].pct;
        setPulse(true);
        setTimeout(() => setPulse(false), 300);
      }
    }, STEP_INTERVAL);

    // Smooth progress bar
    const pctTimer = setInterval(() => {
      if (pctRef.current < targetPctRef.current) {
        pctRef.current = Math.min(pctRef.current + 1, targetPctRef.current);
        setDisplayPct(pctRef.current);
      }
    }, 60);

    // Finish at 10s
    timerRef.current = setTimeout(() => {
      clearInterval(stepTimer);
      clearInterval(pctTimer);
      setDisplayPct(100);
      setTimeout(onComplete, 300);
    }, TOTAL_MS);

    intervalRef.current = pctTimer;

    return () => {
      clearInterval(stepTimer);
      clearInterval(pctTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onComplete, STEP_INTERVAL]);

  const step = STEPS[stepIndex];

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #05060f 0%, #0d0821 35%, #060d1f 65%, #0a0512 100%)",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600, height: 600,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)",
          animation: "ambientPulse 4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400, height: 400,
          top: "30%", left: "20%",
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)",
          animation: "ambientPulse 5s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 300, height: 300,
          bottom: "20%", right: "15%",
          background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%)",
          animation: "ambientPulse 6s ease-in-out infinite 1s",
        }}
      />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              i % 3 === 0
                ? "rgba(99,102,241,0.7)"
                : i % 3 === 1
                ? "rgba(139,92,246,0.6)"
                : "rgba(6,182,212,0.6)",
            boxShadow:
              i % 3 === 0
                ? "0 0 6px rgba(99,102,241,0.8)"
                : i % 3 === 1
                ? "0 0 6px rgba(139,92,246,0.8)"
                : "0 0 6px rgba(6,182,212,0.8)",
            animation: `floatParticle ${p.dur}s ease-in-out infinite ${p.delay}s`,
          }}
        />
      ))}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main card */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-8 max-w-lg w-full"
        style={{ filter: "drop-shadow(0 0 80px rgba(99,102,241,0.15))" }}
      >
        {/* Central orb */}
        <div className="relative mb-10">
          {/* Outer glow ring */}
          <div
            className="absolute rounded-full"
            style={{
              inset: -16,
              background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
              animation: "outerGlow 3s ease-in-out infinite",
            }}
          />

          {/* Orbit ring 1 */}
          <div
            className="absolute rounded-full border"
            style={{
              inset: -8,
              borderColor: "rgba(99,102,241,0.3)",
              animation: "orbitRing1 6s linear infinite",
            }}
          >
            <div
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                top: "50%", left: -5,
                transform: "translateY(-50%)",
                background: "#6366f1",
                boxShadow: "0 0 10px #6366f1",
              }}
            />
          </div>

          {/* Orbit ring 2 */}
          <div
            className="absolute rounded-full border"
            style={{
              inset: -20,
              borderColor: "rgba(139,92,246,0.2)",
              animation: "orbitRing2 9s linear infinite reverse",
            }}
          >
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{
                top: -4, left: "50%",
                transform: "translateX(-50%)",
                background: "#8b5cf6",
                boxShadow: "0 0 8px #8b5cf6",
              }}
            />
          </div>

          {/* Orbit ring 3 */}
          <div
            className="absolute rounded-full border"
            style={{
              inset: -32,
              borderColor: "rgba(6,182,212,0.15)",
              animation: "orbitRing1 14s linear infinite",
            }}
          >
            <div
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                bottom: -3, right: "20%",
                background: "#06b6d4",
                boxShadow: "0 0 6px #06b6d4",
              }}
            />
          </div>

          {/* Core orb */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, #4338ca, #7c3aed, #0e7490)",
              boxShadow: "0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* Inner shimmer */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
              }}
            />
            <span style={{ fontSize: 36 }}>🤖</span>
          </div>
        </div>

        {/* Phase badge */}
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 transition-all duration-500"
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#6366f1", boxShadow: "0 0 6px #6366f1" }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#a5b4fc" }}
          >
            {step.phase}
          </span>
        </div>

        {/* Step message */}
        <div
          className="min-h-[72px] flex flex-col items-center justify-center mb-8 transition-all duration-500"
          style={{ opacity: pulse ? 0.6 : 1 }}
        >
          <h2
            className="text-xl font-bold mb-2"
            style={{
              color: "#e2e8f0",
              textShadow: "0 0 20px rgba(99,102,241,0.4)",
            }}
          >
            {step.message}
          </h2>
          <p className="text-sm" style={{ color: "rgba(148,163,184,0.8)" }}>
            {step.sub}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm mb-4">
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
              style={{
                width: `${displayPct}%`,
                background: "linear-gradient(90deg, #4338ca, #7c3aed, #06b6d4)",
                boxShadow: "0 0 12px rgba(99,102,241,0.7)",
              }}
            >
              {/* Shimmer sweep */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                  animation: "shimmer 1.5s linear infinite",
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold"
                style={{
                  background: "linear-gradient(135deg, #4338ca, #7c3aed)",
                  color: "#fff",
                }}
              >
                AI
              </div>
              <span className="text-xs font-semibold" style={{ color: "rgba(148,163,184,0.7)" }}>
                AI Portfolio Maker
              </span>
            </div>
            <span
              className="text-sm font-extrabold tabular-nums"
              style={{ color: "#a5b4fc" }}
            >
              {displayPct}%
            </span>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === stepIndex ? 20 : 5,
                height: 5,
                background:
                  i < stepIndex
                    ? "#4338ca"
                    : i === stepIndex
                    ? "#7c3aed"
                    : "rgba(255,255,255,0.1)",
                boxShadow: i === stepIndex ? "0 0 8px rgba(124,58,237,0.8)" : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ambientPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50%       { transform: translate(-50%, -50%) scale(1.15); opacity: 0.7; }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50%       { transform: translateY(-14px) scale(1.2); opacity: 1; }
        }
        @keyframes orbitRing1 {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbitRing2 {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes outerGlow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default GeneratePreloader;
