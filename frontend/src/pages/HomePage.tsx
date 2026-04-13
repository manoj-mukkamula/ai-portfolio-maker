// src/pages/HomePage.tsx
// Enhanced "How it works" section with animated connectors, richer copy,
// numbered badges, and an interactive hover state per step.
// "How it works" is ONLY here (removed from Dashboard).

import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Sparkles, Upload, Cpu, Download, Palette,
  Zap, Shield, Sun, Moon, BrainCircuit,
  ArrowRight, Check, FileText, Eye,
} from "lucide-react";

const FEATURES = [
  {
    icon: Cpu,
    title: "Powered by Gemini AI",
    desc: "Google's most capable AI model reads your resume and intelligently fills every section of your portfolio.",
    color: "#6366f1",
  },
  {
    icon: Zap,
    title: "Ready in seconds",
    desc: "From resume upload to a polished, live portfolio in under a minute. No setup, no code required.",
    color: "#f59e0b",
  },
  {
    icon: Palette,
    title: "6 premium templates",
    desc: "Hand-crafted templates spanning minimal, dark, editorial, and luxury design aesthetics.",
    color: "#8b5cf6",
  },
  {
    icon: Download,
    title: "Export as HTML",
    desc: "Download your portfolio as a single HTML file you can host anywhere, including GitHub Pages.",
    color: "#10b981",
  },
  {
    icon: Shield,
    title: "Your data, your control",
    desc: "Portfolios are tied to your account. Edit, delete, or download them anytime you like.",
    color: "#06b6d4",
  },
  {
    icon: Upload,
    title: "PDF and DOCX support",
    desc: "Upload directly from your file system or paste plain text — whichever works for you.",
    color: "#ec4899",
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: Upload,
    color: "#6366f1",
    title: "Upload your resume",
    desc: "Drop a PDF or DOCX, or paste your resume text directly into the editor. Supports all standard resume formats.",
    detail: "Max 5 MB · PDF & DOCX",
  },
  {
    step: 2,
    icon: Palette,
    color: "#8b5cf6",
    title: "Choose a template",
    desc: "Browse 6 professionally designed portfolio styles. Each one has a distinct aesthetic so your work gets the presentation it deserves.",
    detail: "6 templates · Live preview",
  },
  {
    step: 3,
    icon: Cpu,
    color: "#0ea5e9",
    title: "Gemini AI builds it",
    desc: "Google Gemini reads your entire resume, extracts every detail, and writes compelling copy for each portfolio section automatically.",
    detail: "Powered by Gemini 1.5 Pro",
  },
  {
    step: 4,
    icon: Eye,
    color: "#10b981",
    title: "Preview and refine",
    desc: "Review your portfolio in the built-in preview. Use the code editor to make any tweaks directly to the HTML.",
    detail: "Live editor · Instant preview",
  },
  {
    step: 5,
    icon: Download,
    color: "#f59e0b",
    title: "Download or share",
    desc: "Export a self-contained HTML file you can host anywhere. Share a preview link or deploy to GitHub Pages in minutes.",
    detail: "HTML export · Shareable link",
  },
];

const HomePage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ scrollBehavior: "smooth" }}>
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground text-sm">AI Portfolio Maker</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6">
            <a href="#features"     className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">How it works</a>
            <Link to="/about"   className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">About</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Contact</Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
          style={{ backgroundImage: "radial-gradient(ellipse at 60% 50%, #6366f1 0%, transparent 65%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(ellipse at 30% 70%, #8b5cf6 0%, transparent 65%)" }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
            Your resume, turned into
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)" }}
            >
              a portfolio that stands out
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your resume. Pick a template. Let AI build the rest.
            Get a professional portfolio website in under a minute, no coding needed.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 hover:shadow-xl transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              Generate my portfolio
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-secondary transition-all"
            >
              See how it works
            </a>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
            {["No credit card required", "5 free credits to start", "Export as HTML"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[11px] tracking-widest text-primary font-semibold uppercase mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Everything you need, nothing you don't
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              Built for students and professionals who want a great portfolio without spending hours on design.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/25 hover:shadow-elevated transition-all duration-300"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 border-t border-border bg-secondary/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-widest text-primary font-semibold uppercase mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              From resume to portfolio in 5 steps
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              No manual data entry. No design skills needed.
              Upload once and let the AI do everything else.
            </p>
          </div>

          {/* Steps — vertical timeline on mobile, horizontal on desktop */}
          <div className="relative">
            {/* Horizontal connector line (desktop only) */}
            <div
              className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-px"
              style={{ background: "linear-gradient(90deg, transparent, #6366f1, #8b5cf6, #06b6d4, transparent)" }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
              {HOW_IT_WORKS.map((step, i) => (
                <div
                  key={step.step}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* Vertical connector (mobile only) */}
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div
                      className="lg:hidden absolute left-1/2 -translate-x-1/2 top-[80px] w-px h-10"
                      style={{ background: "linear-gradient(180deg, #6366f1, transparent)" }}
                    />
                  )}

                  {/* Icon circle */}
                  <div className="relative mb-5 z-10">
                    {/* Outer glow */}
                    <div
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle, ${step.color}30 0%, transparent 70%)`,
                        transform: "scale(1.8)",
                      }}
                    />
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1 relative"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}22, ${step.color}10)`,
                        border: `1.5px solid ${step.color}40`,
                        boxShadow: `0 4px 20px ${step.color}20`,
                      }}
                    >
                      <step.icon className="w-6 h-6" style={{ color: step.color }} />
                    </div>

                    {/* Step number badge */}
                    <div
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-extrabold text-white flex items-center justify-center"
                      style={{ background: step.color, boxShadow: `0 2px 8px ${step.color}60` }}
                    >
                      {step.step}
                    </div>
                  </div>

                  <h3 className="font-bold text-foreground text-sm mb-2 leading-snug">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{step.desc}</p>

                  {/* Detail pill */}
                  <span
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: `${step.color}12`,
                      color: step.color,
                      border: `1px solid ${step.color}25`,
                    }}
                  >
                    {step.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA below steps */}
          <div className="mt-14 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
              }}
            >
              <FileText className="w-4 h-4" />
              Try it with your resume
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="rounded-3xl p-12 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0e7490 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 30% 50%, #fff 0%, transparent 60%), radial-gradient(circle at 70% 50%, #fff 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold mb-4">Ready to build your portfolio?</h2>
              <p className="text-white/75 text-base mb-8 max-w-md mx-auto">
                Join and create a professional portfolio in minutes. Free to start.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white font-semibold text-sm hover:bg-white/90 transition-all active:scale-[0.98]"
                style={{ color: "#4f46e5" }}
              >
                <Sparkles className="w-4 h-4" />
                Get started for free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <BrainCircuit className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">AI Portfolio Maker</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link to="/about"   className="hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link to="/login"   className="hover:text-foreground transition-colors">Sign in</Link>
          </div>
          <p className="text-xs text-muted-foreground">Built with Google Gemini AI</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
