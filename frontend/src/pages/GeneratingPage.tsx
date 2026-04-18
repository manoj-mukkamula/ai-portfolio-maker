// src/pages/GeneratingPage.tsx
// Full-page skeleton shown while Gemini generates the portfolio.
// Receives templateId + portfolioId via location state.
// Polls for completion and transitions to PreviewPage smoothly.

import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, BrainCircuit } from "lucide-react";

// ─── Step messages ──────────────────────────────────────────────────────────
const STEPS = [
  { label: "Analyzing resume content",     pct: 15 },
  { label: "Extracting skills and details", pct: 35 },
  { label: "Generating portfolio content",  pct: 55 },
  { label: "Applying template design",      pct: 75 },
  { label: "Finalising your portfolio",     pct: 92 },
];

// ─── Shimmer animation CSS ──────────────────────────────────────────────────
const SHIMMER_CSS = `
  @keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%);  }
  }
  .shimmer-block {
    position: relative;
    overflow: hidden;
    background: var(--shimmer-base, rgba(148,163,184,0.12));
    border-radius: 0.5rem;
  }
  .shimmer-block::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--shimmer-highlight, rgba(255,255,255,0.07)) 50%,
      transparent 100%
    );
    animation: shimmer 1.6s ease-in-out infinite;
  }
  .dark .shimmer-block {
    --shimmer-base: rgba(255,255,255,0.05);
    --shimmer-highlight: rgba(255,255,255,0.09);
  }
  @keyframes fade-in-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0);     }
  }
  .fade-in-up { animation: fade-in-up 0.5s ease both; }
`;

// ─── Generic shimmer block ───────────────────────────────────────────────────
function Sh({ w = "100%", h = "1rem", delay = 0, radius = "0.5rem" }: {
  w?: string; h?: string; delay?: number; radius?: string;
}) {
  return (
    <div
      className="shimmer-block"
      style={{ width: w, height: h, borderRadius: radius, animationDelay: `${delay}ms` }}
    />
  );
}

// ─── Template-aware skeleton layouts ────────────────────────────────────────
function SkeletonGlassTerminal() {
  return (
    <div className="min-h-screen bg-[#060a12] text-white font-mono p-0 overflow-hidden">
      {/* Nav */}
      <div className="h-14 border-b border-white/[0.06] flex items-center px-8 justify-between">
        <Sh w="120px" h="12px" />
        <div className="flex gap-6">
          {[80, 64, 72, 60].map((w, i) => <Sh key={i} w={`${w}px`} h="10px" delay={i * 60} />)}
        </div>
      </div>
      {/* Hero */}
      <div className="px-16 pt-24 pb-16">
        <Sh w="180px" h="11px" delay={100} />
        <div className="mt-6 space-y-3">
          <Sh w="70%" h="72px" delay={150} radius="4px" />
          <Sh w="50%" h="72px" delay={200} radius="4px" />
        </div>
        <div className="mt-8 space-y-2">
          <Sh w="480px" h="13px" delay={250} />
          <Sh w="360px" h="13px" delay={300} />
        </div>
        <div className="mt-8 flex gap-3">
          <Sh w="140px" h="42px" delay={350} radius="2px" />
          <Sh w="140px" h="42px" delay={400} radius="2px" />
        </div>
      </div>
      {/* Skills */}
      <div className="px-16 py-12 border-t border-white/[0.04]">
        <Sh w="100px" h="12px" delay={100} />
        <div className="mt-5 flex flex-wrap gap-3">
          {[88, 72, 100, 64, 80, 96, 68, 76].map((w, i) => (
            <Sh key={i} w={`${w}px`} h="32px" delay={i * 50} radius="2px" />
          ))}
        </div>
      </div>
      {/* Projects */}
      <div className="px-16 py-12 border-t border-white/[0.04]">
        <Sh w="120px" h="12px" delay={100} />
        <div className="mt-5 grid grid-cols-2 gap-4">
          {[0, 1].map(i => (
            <div key={i} className="p-5 border border-white/[0.06] space-y-3" style={{ borderRadius: "2px" }}>
              <Sh w="60%" h="14px" delay={i * 80} />
              <Sh w="100%" h="10px" delay={i * 80 + 40} />
              <Sh w="80%" h="10px" delay={i * 80 + 80} />
              <div className="flex gap-2 mt-2">
                {[60, 48, 52].map((w, j) => <Sh key={j} w={`${w}px`} h="22px" delay={j * 40} radius="2px" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonBrutalistGrid() {
  return (
    <div className="min-h-screen bg-[#f0ebe0] p-0 overflow-hidden">
      {/* Nav bar */}
      <div className="h-14 border-b-2 border-black flex items-center px-8 justify-between bg-[#f0ebe0]">
        <Sh w="200px" h="13px" />
        <div className="flex gap-8">
          {[48, 56, 40, 64].map((w, i) => <Sh key={i} w={`${w}px`} h="11px" delay={i * 60} />)}
        </div>
      </div>
      {/* Split hero */}
      <div className="flex h-[420px] border-b-2 border-black">
        <div className="flex-1 p-12 border-r-2 border-black space-y-4">
          <Sh w="220px" h="11px" delay={80} />
          <Sh w="85%" h="80px" delay={120} radius="2px" />
          <Sh w="65%" h="80px" delay={160} radius="2px" />
        </div>
        <div className="w-[340px] p-10 space-y-3 bg-[#e8e0cc]">
          <Sh w="80px" h="28px" delay={100} radius="2px" />
          <Sh w="100%" h="12px" delay={160} />
          <Sh w="100%" h="12px" delay={200} />
          <Sh w="90%" h="12px" delay={240} />
          <Sh w="95%" h="12px" delay={280} />
        </div>
      </div>
      {/* Skills grid */}
      <div className="grid grid-cols-4 border-b-2 border-black">
        {[0,1,2,3].map(i => (
          <div key={i} className={`p-8 space-y-2 ${i < 3 ? "border-r-2 border-black" : ""}`}>
            <Sh w="60%" h="13px" delay={i * 60} radius="2px" />
            <Sh w="40%" h="10px" delay={i * 60 + 40} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonAuroraLuxury() {
  return (
    <div className="min-h-screen p-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #1a0533 0%, #08090d 100%)" }}>
      <div className="h-16 border-b border-white/[0.05] flex items-center px-10 justify-between">
        <Sh w="140px" h="11px" />
        <div className="flex gap-6">
          {[64, 72, 56, 68].map((w, i) => <Sh key={i} w={`${w}px`} h="10px" delay={i * 60} />)}
        </div>
      </div>
      <div className="px-16 pt-24 pb-12">
        <Sh w="160px" h="10px" delay={80} />
        <div className="mt-6 space-y-3">
          <Sh w="75%" h="64px" delay={120} radius="4px" />
          <Sh w="55%" h="64px" delay={160} radius="4px" />
        </div>
        <div className="mt-8 space-y-2">
          <Sh w="500px" h="12px" delay={200} />
          <Sh w="380px" h="12px" delay={240} />
        </div>
        <div className="mt-8 flex gap-4">
          <Sh w="150px" h="44px" delay={280} radius="22px" />
          <Sh w="150px" h="44px" delay={320} radius="22px" />
        </div>
      </div>
      <div className="px-16 py-10 border-t border-white/[0.04]">
        <Sh w="100px" h="10px" delay={80} />
        <div className="mt-5 grid grid-cols-3 gap-4">
          {[0,1,2].map(i => (
            <div key={i} className="p-5 rounded-xl space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Sh w="50%" h="13px" delay={i * 80} />
              <Sh w="100%" h="10px" delay={i * 80 + 40} />
              <Sh w="80%" h="10px" delay={i * 80 + 80} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonSwissPrecision() {
  return (
    <div className="min-h-screen bg-[#f7f4ef] p-0 overflow-hidden">
      <div className="h-16 border-b border-[#d4cfc5] flex items-center px-10 justify-between">
        <Sh w="160px" h="12px" />
        <div className="flex gap-8">
          {[52, 60, 48, 56].map((w, i) => <Sh key={i} w={`${w}px`} h="10px" delay={i * 60} />)}
        </div>
      </div>
      <div className="grid grid-cols-12 border-b border-[#d4cfc5] min-h-[380px]">
        <div className="col-span-7 p-12 border-r border-[#d4cfc5] space-y-4">
          <Sh w="180px" h="10px" delay={80} />
          <Sh w="90%" h="56px" delay={120} radius="2px" />
          <Sh w="70%" h="56px" delay={160} radius="2px" />
          <div className="space-y-2 mt-4">
            <Sh w="100%" h="11px" delay={200} />
            <Sh w="90%" h="11px" delay={240} />
          </div>
        </div>
        <div className="col-span-5 p-10 space-y-4">
          {[["Name","80%"], ["Role","60%"], ["Email","70%"], ["Location","50%"]].map(([, w], i) => (
            <div key={i} className="border-b border-[#d4cfc5] pb-3 space-y-1">
              <Sh w="60px" h="9px" delay={i * 60} />
              <Sh w={w} h="12px" delay={i * 60 + 40} />
            </div>
          ))}
        </div>
      </div>
      <div className="px-12 py-8">
        <Sh w="80px" h="10px" delay={80} />
        <div className="mt-4 flex flex-wrap gap-3">
          {[80, 96, 64, 88, 72, 100, 60].map((w, i) => (
            <Sh key={i} w={`${w}px`} h="28px" delay={i * 40} radius="14px" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonObsidianCode() {
  return (
    <div className="min-h-screen p-0 overflow-hidden" style={{ background: "#1e1e2e" }}>
      <div className="h-14 border-b border-white/[0.06] flex items-center px-8 justify-between">
        <Sh w="130px" h="11px" />
        <div className="flex gap-6">
          {[72, 60, 80, 56].map((w, i) => <Sh key={i} w={`${w}px`} h="10px" delay={i * 60} />)}
        </div>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen border-r border-white/[0.05] p-6 space-y-4">
          <Sh w="80px" h="80px" radius="50%" />
          <Sh w="70%" h="14px" delay={80} />
          <Sh w="90%" h="10px" delay={120} />
          <div className="pt-4 space-y-2">
            {[100, 85, 90, 75, 80].map((w, i) => (
              <Sh key={i} w={`${w}%`} h="10px" delay={i * 50} />
            ))}
          </div>
        </div>
        {/* Main */}
        <div className="flex-1 p-10 space-y-6">
          <div className="space-y-2">
            <Sh w="60%" h="40px" delay={80} radius="4px" />
            <Sh w="100%" h="11px" delay={120} />
            <Sh w="80%" h="11px" delay={160} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[0,1,2,3].map(i => (
              <div key={i} className="p-4 rounded-lg space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <Sh w="55%" h="12px" delay={i * 60} />
                <Sh w="100%" h="9px" delay={i * 60 + 40} />
                <Sh w="75%" h="9px" delay={i * 60 + 80} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonKineticMagazine() {
  return (
    <div className="min-h-screen bg-[#faf8f3] p-0 overflow-hidden">
      <div className="h-16 border-b-2 border-[#1a1a1a] flex items-center px-10 justify-between">
        <Sh w="180px" h="13px" />
        <div className="flex gap-8">
          {[52, 64, 48, 72].map((w, i) => <Sh key={i} w={`${w}px`} h="11px" delay={i * 60} />)}
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="p-14 border-r-2 border-[#1a1a1a] space-y-4">
          <Sh w="160px" h="11px" delay={80} />
          <Sh w="90%" h="64px" delay={120} radius="2px" />
          <Sh w="70%" h="64px" delay={160} radius="2px" />
          <div className="space-y-2 mt-4">
            <Sh w="100%" h="12px" delay={200} />
            <Sh w="85%" h="12px" delay={240} />
          </div>
        </div>
        <div className="p-14 space-y-4 bg-[#1a1a1a]">
          <Sh w="100px" h="32px" delay={80} radius="2px" />
          {[100, 90, 95, 80].map((w, i) => (
            <Sh key={i} w={`${w}%`} h="13px" delay={i * 60 + 100} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 border-t-2 border-[#1a1a1a]">
        {[0,1,2].map(i => (
          <div key={i} className={`p-8 space-y-3 ${i < 2 ? "border-r-2 border-[#1a1a1a]" : ""}`}>
            <Sh w="50%" h="13px" delay={i * 80} radius="2px" />
            <Sh w="100%" h="10px" delay={i * 80 + 40} />
            <Sh w="80%" h="10px" delay={i * 80 + 80} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonAuroraStudio() {
  return (
    <div className="min-h-screen p-0 overflow-hidden" style={{ background: "#f7f6f2" }}>
      <div
        className="max-w-5xl mx-auto px-8 py-12"
        style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "4rem" }}
      >
        {/* Left rail */}
        <div className="space-y-5">
          <Sh w="100px" h="10px" delay={0} />
          <Sh w="75%" h="52px" delay={60} radius="4px" />
          <Sh w="55%" h="14px" delay={100} />
          <div className="space-y-2 mt-4">
            <Sh w="100%" h="10px" delay={140} />
            <Sh w="90%" h="10px" delay={180} />
            <Sh w="80%" h="10px" delay={220} />
          </div>
          <div className="space-y-2 mt-6 pt-4" style={{ borderTop: "1px solid rgba(20,20,22,0.08)" }}>
            {[["Location","70%"],["Email","85%"],["Phone","60%"]].map(([,w],i) => (
              <div key={i} className="flex justify-between">
                <Sh w="60px" h="9px" delay={i*50} />
                <Sh w={w} h="9px" delay={i*50+30} />
              </div>
            ))}
          </div>
          <Sh w="140px" h="40px" delay={200} radius="10px" />
        </div>
        {/* Right content */}
        <div className="space-y-10">
          <div className="space-y-3">
            <div className="flex justify-between"><Sh w="120px" h="16px" /><Sh w="30px" h="11px" /></div>
            <div className="flex flex-wrap gap-2 mt-3">
              {[80,72,96,60,84,68,76,88,64].map((w,i) => <Sh key={i} w={`${w}px`} h="30px" delay={i*30} radius="8px" />)}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><Sh w="140px" h="16px" /><Sh w="30px" h="11px" /></div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[0,1,2,3].map(i => (
                <div key={i} className="p-5 rounded-xl space-y-2" style={{ background: "#fff", border: "1px solid rgba(20,20,22,0.08)" }}>
                  <Sh w="65%" h="14px" delay={i*60} />
                  <Sh w="100%" h="10px" delay={i*60+40} />
                  <Sh w="80%" h="10px" delay={i*60+80} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonVantaPro() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: "#08080a" }}>
      {/* Nav */}
      <div className="h-14 border-b flex items-center px-10 justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <Sh w="22px" h="22px" radius="7px" />
          <Sh w="100px" h="11px" />
        </div>
        <div className="flex gap-6">
          {[72,60,80,56,68].map((w,i) => <Sh key={i} w={`${w}px`} h="10px" delay={i*50} />)}
        </div>
        <Sh w="80px" h="34px" delay={200} radius="8px" />
      </div>
      {/* Hero */}
      <div className="px-12 pt-20 pb-10">
        <Sh w="180px" h="10px" delay={80} radius="2px" />
        <div className="mt-6 space-y-3">
          <Sh w="72%" h="72px" delay={120} radius="6px" />
          <Sh w="52%" h="72px" delay={160} radius="6px" />
        </div>
        <div className="mt-6 space-y-2">
          <Sh w="480px" h="13px" delay={200} />
          <Sh w="360px" h="13px" delay={240} />
        </div>
        <div className="mt-8 flex gap-4">
          <Sh w="160px" h="46px" delay={280} radius="10px" />
          <Sh w="120px" h="46px" delay={320} radius="10px" />
        </div>
        {/* Metrics */}
        <div className="mt-14 grid grid-cols-4 gap-4">
          {[0,1,2,3].map(i => (
            <div key={i} className="p-5 rounded-xl space-y-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Sh w="50px" h="30px" delay={i*60} radius="4px" />
              <Sh w="80%" h="10px" delay={i*60+40} />
            </div>
          ))}
        </div>
      </div>
      {/* Skills marquee bar */}
      <div className="h-12 flex items-center gap-4 px-12 overflow-hidden" style={{ background: "rgba(255,255,255,0.025)" }}>
        {[88,72,96,64,80,76,68,92,60].map((w,i) => <Sh key={i} w={`${w}px`} h="28px" delay={i*40} radius="14px" />)}
      </div>
    </div>
  );
}

function SkeletonDeepDarkMinimal() {
  return (
    <div className="min-h-screen p-0 overflow-hidden" style={{ background: "#090910" }}>
      <div className="h-14 border-b flex items-center px-10 justify-between" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <Sh w="140px" h="11px" />
        <div className="flex gap-6">
          {[60, 72, 56, 64].map((w, i) => <Sh key={i} w={`${w}px`} h="10px" delay={i * 60} />)}
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-8 pt-24 pb-12">
        <Sh w="120px" h="10px" delay={80} />
        <div className="mt-6 space-y-3">
          <Sh w="80%" h="56px" delay={120} radius="6px" />
          <Sh w="60%" h="56px" delay={160} radius="6px" />
        </div>
        <div className="mt-8 space-y-2">
          <Sh w="480px" h="12px" delay={200} />
          <Sh w="360px" h="12px" delay={240} />
        </div>
        <div className="mt-8 flex gap-4">
          <Sh w="140px" h="44px" delay={280} radius="8px" />
          <Sh w="120px" h="44px" delay={320} radius="8px" />
        </div>
        <div className="mt-16 space-y-4">
          <Sh w="80px" h="10px" delay={80} />
          <div className="flex flex-wrap gap-2 mt-3">
            {[80, 68, 96, 60, 84, 72, 88, 64].map((w, i) => (
              <Sh key={i} w={`${w}px`} h="30px" delay={i * 40} radius="6px" />
            ))}
          </div>
        </div>
        <div className="mt-12 space-y-4">
          <Sh w="100px" h="10px" delay={80} />
          <div className="grid grid-cols-2 gap-4 mt-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="p-5 rounded-xl space-y-2" style={{ background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.1)" }}>
                <Sh w="60%" h="13px" delay={i * 60} />
                <Sh w="100%" h="10px" delay={i * 60 + 40} />
                <Sh w="80%" h="10px" delay={i * 60 + 80} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCleanLightUnique() {
  return (
    <div className="min-h-screen p-0 overflow-hidden" style={{ background: "#fafaf9" }}>
      <div className="h-16 border-b flex items-center px-10 justify-between" style={{ borderColor: "#e5e3de" }}>
        <Sh w="160px" h="12px" />
        <div className="flex gap-8">
          {[52, 60, 48, 64].map((w, i) => <Sh key={i} w={`${w}px`} h="10px" delay={i * 60} />)}
        </div>
        <Sh w="100px" h="36px" radius="8px" delay={200} />
      </div>
      <div className="max-w-4xl mx-auto px-8 pt-20 pb-12">
        <Sh w="120px" h="10px" delay={80} />
        <div className="mt-5 space-y-3">
          <Sh w="75%" h="52px" delay={120} radius="4px" />
          <Sh w="55%" h="52px" delay={160} radius="4px" />
        </div>
        <div className="mt-6 space-y-2">
          <Sh w="440px" h="13px" delay={200} />
          <Sh w="340px" h="13px" delay={240} />
        </div>
        <div className="mt-8 flex gap-3">
          <Sh w="140px" h="44px" delay={280} radius="8px" />
          <Sh w="120px" h="44px" delay={320} radius="8px" />
        </div>
        <div className="mt-14 grid grid-cols-3 gap-5">
          {[0, 1, 2].map(i => (
            <div key={i} className="p-6 rounded-xl space-y-3" style={{ background: "#fff", border: "1px solid #e5e3de" }}>
              <Sh w="40px" h="40px" radius="10px" delay={i * 80} />
              <Sh w="70%" h="14px" delay={i * 80 + 40} />
              <Sh w="100%" h="11px" delay={i * 80 + 80} />
              <Sh w="90%" h="11px" delay={i * 80 + 120} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SKELETON_MAP: Record<string, React.FC> = {
  "glass-terminal":     SkeletonGlassTerminal,
  "brutalist-grid":     SkeletonBrutalistGrid,
  "aurora-luxury":      SkeletonAuroraLuxury,
  "swiss-precision":    SkeletonSwissPrecision,
  "obsidian-code":      SkeletonObsidianCode,
  "kinetic-magazine":   SkeletonKineticMagazine,
  "aurora-studio":      SkeletonAuroraStudio,
  "vanta-pro":          SkeletonVantaPro,
  "deep-dark-minimal":  SkeletonDeepDarkMinimal,
  "clean-light-unique": SkeletonCleanLightUnique,
};

// ─── GeneratingPage ──────────────────────────────────────────────────────────
interface LocationState {
  portfolioId?: string;
  templateId?: string;
}

const GeneratingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const { portfolioId, templateId = "glass-terminal" } = state;

  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const doneRef = useRef(false);

  const SkeletonComp = SKELETON_MAP[templateId] ?? SkeletonGlassTerminal;
  const currentStep = STEPS[Math.min(stepIdx, STEPS.length - 1)];

  // Animate progress bar through steps
  useEffect(() => {
    const advance = () => {
      setStepIdx(i => {
        const next = i + 1;
        if (next < STEPS.length) {
          setProgress(STEPS[next].pct);
          return next;
        }
        return i;
      });
    };
    const id = setInterval(advance, 3800);
    setProgress(STEPS[0].pct);
    return () => clearInterval(id);
  }, []);

  // When portfolioId arrives (passed from generate flow) wait a moment then go
  useEffect(() => {
    if (portfolioId && !doneRef.current) {
      doneRef.current = true;
      setProgress(100);
      setStepIdx(STEPS.length - 1);
      setReady(true);
      const t = setTimeout(() => {
        navigate(`/preview/${portfolioId}`, { replace: true });
      }, 900);
      return () => clearTimeout(t);
    }
  }, [portfolioId, navigate]);

  // Safety redirect if page loaded without portfolioId and no generation pending
  useEffect(() => {
    if (!portfolioId) {
      const t = setTimeout(() => navigate("/generate", { replace: true }), 45000);
      return () => clearTimeout(t);
    }
  }, [portfolioId, navigate]);

  return (
    <>
      <style>{SHIMMER_CSS}</style>

      <div className={`fixed inset-0 z-50 flex flex-col bg-background transition-opacity duration-700 ${ready ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

        {/* Top progress bar */}
        <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-border">
          <div
            className="h-full transition-all duration-1000 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6, #22c55e)",
            }}
          />
        </div>

        {/* Status bar */}
        <div className="fixed top-0 left-0 right-0 z-[55] h-12 flex items-center justify-between px-6 bg-card/90 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground">AI Portfolio Maker</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex gap-1">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="transition-all duration-500 rounded-full"
                    style={{
                      width: i <= stepIdx ? "20px" : "6px",
                      height: "6px",
                      background: i < stepIdx ? "#22c55e" : i === stepIdx ? "#6366f1" : "rgba(148,163,184,0.3)",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Generating</span>
            </div>
          </div>
        </div>

        {/* Skeleton preview (full page, offset for status bar) */}
        <div className="flex-1 overflow-hidden mt-12 fade-in-up" style={{ animationDelay: "100ms" }}>
          <SkeletonComp />
        </div>

        {/* Bottom status strip */}
        <div className="fixed bottom-0 left-0 right-0 z-[55] h-14 flex items-center justify-between px-6 bg-card/90 backdrop-blur-md border-t border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 animate-pulse"
              style={{ background: "rgba(99,102,241,0.15)" }}
            >
              <BrainCircuit className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground transition-all duration-500">
                {currentStep.label}
              </p>
              <p className="text-[10px] text-muted-foreground">Google Gemini AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary">{progress}%</span>
            <div className="w-28 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GeneratingPage;
