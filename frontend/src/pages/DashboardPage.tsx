// src/pages/DashboardPage.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { portfolioApi } from "@/lib/api";
import {
  Sparkles, ImageIcon, Clock, CalendarDays,
  Pencil, Trash2, ArrowRight, Zap, Upload,
  Cpu, Download, Eye, ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  _id: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATE_STYLES: Record<string, { bg: string; accent: string; label: string; tag: string }> = {
  "glass-terminal":   { bg: "from-[#060a12] to-[#0d2137]",  accent: "#00ff88",  label: "Glass Terminal",   tag: "Terminal" },
  "brutalist-grid":   { bg: "from-[#0a0a0a] to-[#1a1a1a]",  accent: "#ffdd00",  label: "Brutalist Grid",   tag: "Brutalist" },
  "aurora-luxury":    { bg: "from-[#1a0533] to-[#08090d]",   accent: "#a78bfa",  label: "Aurora Luxury",    tag: "Luxury" },
  "swiss-precision":  { bg: "from-[#f7f4ef] to-[#ede9e1]",   accent: "#0050ff",  label: "Swiss Precision",  tag: "Minimal" },
  "obsidian-code":    { bg: "from-[#1e1e2e] to-[#0a0a0a]",   accent: "#cba6f7",  label: "Obsidian Code",    tag: "Dev" },
  "kinetic-magazine": { bg: "from-[#faf8f3] to-[#f0ebe0]",   accent: "#c84b11",  label: "Kinetic Magazine",  tag: "Editorial" },
};

function PortfolioCard({
  portfolio, onPreview, onEdit, onDelete,
}: {
  portfolio: Portfolio;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const s = TEMPLATE_STYLES[portfolio.templateName] ?? {
    bg: "from-secondary to-muted", accent: "#6366f1", label: portfolio.templateName, tag: "Custom",
  };

  const initial = (portfolio.templateName?.[0] ?? "P").toUpperCase();
  const dateStr = new Date(portfolio.createdAt).toLocaleDateString("en-IN", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-primary/30 flex flex-col">
      {/* Thumbnail */}
      <div
        className={`h-40 bg-gradient-to-br ${s.bg} flex items-center justify-center relative overflow-hidden cursor-pointer`}
        onClick={onPreview}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <span
          className="text-7xl font-extrabold select-none transition-transform duration-500 group-hover:scale-110 relative z-10"
          style={{ color: s.accent, opacity: 0.85, textShadow: `0 0 60px ${s.accent}40` }}
        >
          {initial}
        </span>

        {/* Style tag */}
        <span
          className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm z-10"
          style={{
            background: `${s.accent}22`,
            color: s.accent,
            border: `1px solid ${s.accent}44`,
          }}
        >
          {s.tag}
        </span>

        {/* Preview hint on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <div className="flex items-center gap-1.5 text-white text-sm font-semibold">
            <Eye className="w-4 h-4" /> Preview
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="font-bold text-foreground text-sm leading-snug">{s.label}</p>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">{dateStr}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">AI Generated Portfolio</p>

        {/* 3-button action row — no duplication with hover overlay */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={onPreview}
            className="flex items-center justify-center gap-1.5 flex-1 h-9 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <ExternalLink className="w-3.5 h-3.5" /> View
          </button>
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1.5 flex-1 h-9 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-secondary hover:border-primary/30 transition-all active:scale-[0.97]"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-border hover:bg-destructive/10 hover:border-destructive/40 transition-all active:scale-[0.97] shrink-0"
            title="Delete portfolio"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      </div>
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    icon: Upload,
    title: "Upload your resume",
    desc: "Drop a PDF or DOCX file, or paste your resume text directly into the editor.",
    color: "#6366f1",
    step: 1,
  },
  {
    icon: ImageIcon,
    title: "Pick a template",
    desc: "Browse 6 professionally designed portfolio styles — from minimal to editorial.",
    color: "#8b5cf6",
    step: 2,
  },
  {
    icon: Cpu,
    title: "Gemini AI processes it",
    desc: "Google Gemini reads your resume and fills every section with accurate, structured content.",
    color: "#06b6d4",
    step: 3,
  },
  {
    icon: Download,
    title: "Download or share",
    desc: "Get a standalone HTML file you can host anywhere, or fine-tune it in the built-in editor.",
    color: "#22c55e",
    step: 4,
  },
];

function HowItWorksCard({
  step,
  large,
}: {
  step: (typeof HOW_IT_WORKS)[number];
  large: boolean;
}) {
  return (
    <div
      className="group relative rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-elevated transition-all duration-200 overflow-hidden cursor-default"
      style={{ padding: large ? "1.25rem" : "1rem" }}
    >
      {/* Watermark step number */}
      <span
        className="absolute right-4 top-1/2 -translate-y-1/2 font-black select-none pointer-events-none"
        style={{ color: `${step.color}09`, fontSize: "72px", lineHeight: 1 }}
      >
        {step.step}
      </span>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 shrink-0"
            style={{
              width: large ? "40px" : "34px",
              height: large ? "40px" : "34px",
              background: `${step.color}15`,
              border: `1px solid ${step.color}30`,
            }}
          >
            <step.icon
              style={{ color: step.color, width: large ? "18px" : "15px", height: large ? "18px" : "15px" }}
            />
          </div>
          <span
            className="font-extrabold rounded-full flex items-center justify-center text-white shrink-0"
            style={{ background: step.color, width: "20px", height: "20px", fontSize: "10px" }}
          >
            {step.step}
          </span>
        </div>
        <p className="font-bold text-foreground mb-1" style={{ fontSize: large ? "14px" : "13px" }}>
          {step.title}
        </p>
        <p className="text-muted-foreground leading-relaxed" style={{ fontSize: large ? "13px" : "12px" }}>
          {step.desc}
        </p>
      </div>
    </div>
  );
}

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portfolioApi
      .history()
      .then((res) => setPortfolios(res.data.portfolios || []))
      .catch(() =>
        toast({ title: "Could not load portfolios", description: "Try refreshing the page.", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this portfolio? This cannot be undone.")) return;
    try {
      await portfolioApi.delete(id);
      setPortfolios((prev) => prev.filter((p) => p._id !== id));
      toast({ title: "Portfolio deleted" });
    } catch {
      toast({ title: "Could not delete", description: "Please try again.", variant: "destructive" });
    }
  };

  const recentPortfolios = portfolios.slice(0, 6);
  const totalCount = portfolios.length;
  const credits = user?.credits ?? 0;
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const lastActivity = portfolios[0]
    ? new Date(portfolios[0].updatedAt).toLocaleDateString("en-IN", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "No activity yet";

  const memberSince = user
    ? new Date((user as any).createdAt || Date.now()).getFullYear().toString()
    : new Date().getFullYear().toString();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero */}
        <div
          className="relative rounded-2xl overflow-hidden px-7 py-6 text-white"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0e7490 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div
            className="absolute top-[-40px] right-[-40px] w-56 h-56 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs font-medium tracking-wide mb-0.5">Good to see you back</p>
              <h1 className="text-2xl font-extrabold mb-1.5 leading-tight">Hello, {firstName}! 👋</h1>
              <p className="text-white/75 max-w-md text-sm leading-relaxed">
                Your AI-powered portfolio workspace. Use your credits to generate professional portfolios from your resume in under a minute.
              </p>
            </div>
            <button
              onClick={() => navigate("/generate")}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white font-semibold text-sm transition-all hover:bg-white/90 hover:shadow-lg active:scale-[0.98]"
              style={{ color: "#4f46e5" }}
            >
              <Sparkles className="w-4 h-4" />
              Generate Portfolio
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-elevated transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className={`text-2xl font-extrabold ${credits === 0 ? "text-destructive" : credits <= 2 ? "text-amber-500" : "text-foreground"}`}>
                {credits}
              </span>
            </div>
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold mb-1.5">Credits Left</p>
            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(credits / 5) * 100}%`,
                  background: credits === 0 ? "#ef4444" : credits <= 2 ? "#f59e0b" : "linear-gradient(90deg, #6366f1, #22c55e)",
                }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Resets every 24 hours</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-elevated transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-2xl font-extrabold text-foreground">{totalCount}</span>
            </div>
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold">Portfolios Made</p>
            <p className="text-xs text-muted-foreground mt-1">Total generated so far</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-elevated transition-all duration-300">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold mb-1">Last Activity</p>
            <p className="text-sm font-semibold text-foreground">{lastActivity}</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-elevated transition-all duration-300">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold mb-1">Member Since</p>
            <p className="text-sm font-semibold text-foreground">{memberSince}</p>
          </div>
        </div>

        {/* Recent Portfolios */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Recent Portfolios</h2>
            {totalCount > 6 && (
              <Link to="/history" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="h-40 bg-secondary animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-secondary rounded-lg animate-pulse w-3/4" />
                    <div className="h-3 bg-secondary rounded-lg animate-pulse w-1/2" />
                    <div className="h-9 bg-secondary rounded-xl animate-pulse mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentPortfolios.length === 0 ? (
            <div className="text-center py-14 bg-card rounded-2xl border border-dashed border-border">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6 text-primary/50" />
              </div>
              <p className="text-foreground font-semibold mb-1">No portfolios yet</p>
              <p className="text-sm text-muted-foreground mb-4">Generate your first AI portfolio and see it here.</p>
              <button
                onClick={() => navigate("/generate")}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPortfolios.map((p) => (
                <PortfolioCard
                  key={p._id}
                  portfolio={p}
                  onPreview={() => navigate(`/preview/${p._id}`)}
                  onEdit={() => navigate(`/editor/${p._id}`)}
                  onDelete={() => handleDelete(p._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* How It Works — staggered multi-row layout */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="mb-5">
            <h3 className="font-bold text-foreground text-lg">How AI Portfolio Maker works</h3>
            <p className="text-sm text-muted-foreground mt-0.5">From resume to portfolio in four steps.</p>
          </div>

          {/* Row 1: steps 1 + 2 — larger emphasis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {HOW_IT_WORKS.slice(0, 2).map((step) => (
              <HowItWorksCard key={step.step} step={step} large={true} />
            ))}
          </div>

          {/* Row 2: steps 3 + 4 — slightly compact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HOW_IT_WORKS.slice(2).map((step) => (
              <HowItWorksCard key={step.step} step={step} large={false} />
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default DashboardPage;