// src/pages/HomePage.tsx

import { Link } from "react-router-dom";
import SharedNavbar from "@/components/SharedNavbar";
import { TEMPLATES } from "@/lib/templates";
import {
  Sparkles, Upload, Cpu, Download, Palette,
  Zap, Shield, ArrowRight, Check, FileText, Eye,
  BrainCircuit,
} from "lucide-react";

const FEATURES = [
  {
    icon: Cpu,
    title: "Powered by Gemini AI",
    desc: "Google Gemini reads your resume and fills every portfolio section with accurate, well-written content that sounds like you wrote it yourself.",
    color: "#6366f1",
  },
  {
    icon: Zap,
    title: "Ready in under a minute",
    desc: "From resume upload to a polished portfolio in seconds. No setup, no configuration, no coding required.",
    color: "#f59e0b",
  },
  {
    icon: Palette,
    title: "8 premium templates",
    desc: "Hand-crafted templates spanning minimal, dark, editorial, and luxury design styles. Pick the one that fits your personality.",
    color: "#8b5cf6",
  },
  {
    icon: Download,
    title: "Export as HTML",
    desc: "Download your portfolio as a self-contained HTML file and host it anywhere, including GitHub Pages, for free.",
    color: "#10b981",
  },
  {
    icon: Shield,
    title: "Your data, your control",
    desc: "Every portfolio is tied to your account. Edit, delete, or re-download them whenever you need to.",
    color: "#06b6d4",
  },
  {
    icon: Upload,
    title: "PDF and DOCX support",
    desc: "Drag in a file or paste your resume text directly. Both paths produce the same polished result.",
    color: "#ec4899",
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: Upload,
    color: "#6366f1",
    title: "Upload your resume",
    desc: "Drop a PDF or DOCX, or paste your resume text directly. Works with all standard resume formats.",
    detail: "Max 5 MB · PDF and DOCX",
  },
  {
    step: 2,
    icon: Palette,
    color: "#8b5cf6",
    title: "Choose a template",
    desc: `Browse ${TEMPLATES.length} professionally designed styles, each with a live preview so you know exactly what you are getting.`,
    detail: `${TEMPLATES.length} templates · Live preview`,
  },
  {
    step: 3,
    icon: Cpu,
    color: "#0ea5e9",
    title: "Gemini AI builds it",
    desc: "Google Gemini extracts every detail from your resume and writes compelling, personalised copy for each section.",
    detail: "Powered by Gemini 1.5 Flash",
  },
  {
    step: 4,
    icon: Eye,
    color: "#10b981",
    title: "Preview and refine",
    desc: "Review the result in the built-in preview, then use the code editor to tweak anything directly in the HTML.",
    detail: "Live editor · Instant preview",
  },
  {
    step: 5,
    icon: Download,
    color: "#f59e0b",
    title: "Download or share",
    desc: "Export a self-contained HTML file and host it anywhere. Deploy to GitHub Pages in a few clicks.",
    detail: "HTML export · Shareable link",
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ scrollBehavior: "smooth" }}>
      <SharedNavbar variant="public" />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 sm:py-40">
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.10]"
          style={{ backgroundImage: "radial-gradient(ellipse at 60% 50%, #6366f1 0%, transparent 65%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(ellipse at 30% 70%, #8b5cf6 0%, transparent 65%)" }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-8 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.08] tracking-tight mb-7">
            Your resume, turned into
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)" }}
            >
              a portfolio that stands out
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Upload your resume. Pick a template. Let AI build the rest.
            Get a professional portfolio website in under a minute, no coding needed.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-white font-semibold text-base transition-all duration-200 active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 24px rgba(99,102,241,0.40)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 8px 36px rgba(99,102,241,0.55)";
                el.style.transform = "translateY(-2px) scale(1.02)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 4px 24px rgba(99,102,241,0.40)";
                el.style.transform = "";
              }}
            >
              <Sparkles className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform duration-200" />
              Generate my portfolio
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border border-border text-foreground font-semibold text-base transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5"
            >
              See how it works
            </a>
          </div>

          <div className="mt-10 flex items-center justify-center gap-8 text-sm text-muted-foreground flex-wrap">
            {["No credit card required", "5 free credits to start", "Export as HTML"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm tracking-widest text-primary font-bold uppercase mb-4">Features</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-5 tracking-tight">
              Everything you need, nothing you don't
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
              Built for students and professionals who want a great portfolio without spending hours on design.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-card border border-border rounded-2xl p-7 cursor-default transition-all duration-300"
                style={{ transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-6px) scale(1.015)";
                  el.style.boxShadow = `0 20px 48px -8px ${f.color}28`;
                  el.style.borderColor = `${f.color}45`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "";
                  el.style.boxShadow = "";
                  el.style.borderColor = "";
                }}
              >
                {/* Icon — centered */}
                <div className="flex justify-center mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${f.color}18`, border: `1.5px solid ${f.color}35` }}
                  >
                    <f.icon className="w-7 h-7" style={{ color: f.color }} />
                  </div>
                </div>
                <h3 className="font-bold text-foreground text-base mb-3 text-center">{f.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed text-center">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 border-t border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm tracking-widest text-primary font-bold uppercase mb-4">Process</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-5 tracking-tight">
              From resume to portfolio in 5 steps
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
              No manual data entry. No design skills needed.
              Upload once and let the AI handle everything else.
            </p>
          </div>

          {/* 2-row layout: 3 on top, 2 on bottom centered */}
          <div className="space-y-10 mb-16 mt-2">
            {/* Row 1 — 3 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {HOW_IT_WORKS.slice(0, 3).map((step) => (
                <StepCard key={step.step} step={step} />
              ))}
            </div>
            {/* Row 2 — 2 cards, centered */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:max-w-2xl sm:mx-auto">
              {HOW_IT_WORKS.slice(3).map((step) => (
                <StepCard key={step.step} step={step} />
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-white font-semibold text-base transition-all duration-200 active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 8px 32px rgba(99,102,241,0.5)";
                el.style.transform = "translateY(-2px) scale(1.02)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 4px 20px rgba(99,102,241,0.35)";
                el.style.transform = "";
              }}
            >
              <FileText className="w-4.5 h-4.5" />
              Try it with your resume
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="rounded-3xl p-14 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0e7490 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 30% 50%, #fff 0%, transparent 60%), radial-gradient(circle at 70% 50%, #fff 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 tracking-tight">Ready to build your portfolio?</h2>
              <p className="text-white/75 text-xl mb-10 max-w-md mx-auto">
                Create a professional portfolio in minutes. Free to start, no card needed.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white font-bold text-base transition-all duration-200 hover:bg-white/95 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.97]"
                style={{ color: "#4f46e5" }}
              >
                <Sparkles className="w-4.5 h-4.5" />
                Get started for free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-foreground">AI Portfolio Maker</span>
          </div>
          <div className="flex items-center gap-7 text-sm text-muted-foreground">
            <Link to="/about"   className="hover:text-foreground transition-colors font-medium">About</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors font-medium">Contact</Link>
            <Link to="/login"   className="hover:text-foreground transition-colors font-medium">Sign in</Link>
          </div>
          <p className="text-sm text-muted-foreground">Built with Google Gemini AI</p>
        </div>
      </footer>
    </div>
  );
};

// ── Step Card Sub-component ───────────────────────────────────────────────────
const StepCard = ({ step }: { step: typeof HOW_IT_WORKS[0] }) => (
  <div
    className="group relative flex flex-col items-center text-center p-7 rounded-2xl bg-card border border-border cursor-default"
    style={{
      borderTopWidth: "3px",
      borderTopColor: step.color,
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
    }}
    onMouseEnter={(e) => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = "translateY(-6px)";
      el.style.boxShadow = `0 20px 48px -8px ${step.color}28`;
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = "";
      el.style.boxShadow = "";
    }}
  >
    {/* Icon circle */}
    <div className="relative mb-5 z-10">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1"
        style={{
          background: `linear-gradient(135deg, ${step.color}25, ${step.color}12)`,
          border: `1.5px solid ${step.color}45`,
          boxShadow: `0 4px 20px ${step.color}22`,
        }}
      >
        <step.icon className="w-7 h-7" style={{ color: step.color }} />
      </div>

      {/* Step number badge */}
      <div
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-extrabold text-white flex items-center justify-center"
        style={{ background: step.color, boxShadow: `0 2px 8px ${step.color}60` }}
      >
        {step.step}
      </div>
    </div>

    <h3 className="font-bold text-foreground text-base mb-3 leading-snug">{step.title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.desc}</p>

    {/* Detail pill */}
    <span
      className="text-xs font-semibold px-3 py-1.5 rounded-full"
      style={{
        background: `${step.color}12`,
        color: step.color,
        border: `1px solid ${step.color}28`,
      }}
    >
      {step.detail}
    </span>
  </div>
);

export default HomePage;
