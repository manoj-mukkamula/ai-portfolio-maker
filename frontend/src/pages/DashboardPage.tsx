// src/pages/DashboardPage.tsx
// "How It Works" section removed — it lives on the landing page now.
// Dashboard shows: hero banner, stats, recent portfolios.

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { portfolioApi } from "@/lib/api";
import {
  Sparkles, ImageIcon, Clock, CalendarDays, Pencil, Trash2,
  ArrowRight, Zap, Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  _id: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATE_STYLES: Record<string, { bg: string; accent: string }> = {
  "glass-terminal":   { bg: "from-[#060a12] to-[#0d2137]",  accent: "#00ff88"  },
  "brutalist-grid":   { bg: "from-[#0a0a0a] to-[#1a1a1a]",  accent: "#ffdd00"  },
  "aurora-luxury":    { bg: "from-[#1a0533] to-[#08090d]",   accent: "#a78bfa"  },
  "swiss-precision":  { bg: "from-[#f7f4ef] to-[#ede9e1]",   accent: "#0050ff"  },
  "obsidian-code":    { bg: "from-[#1e1e2e] to-[#0a0a0a]",   accent: "#cba6f7"  },
  "kinetic-magazine": { bg: "from-[#faf8f3] to-[#f0ebe0]",   accent: "#c84b11"  },
};

function PortfolioCard({
  portfolio, onPreview, onEdit, onDelete,
}: {
  portfolio: Portfolio;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const s = TEMPLATE_STYLES[portfolio.templateName] ?? { bg: "from-secondary to-muted", accent: "#6366f1" };
  const initial = (portfolio.templateName?.[0] ?? "P").toUpperCase();
  const dateStr = new Date(portfolio.createdAt).toLocaleDateString("en-IN", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div
      className="group bg-card rounded-2xl border border-border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-primary/30"
      onClick={onPreview}
    >
      <div className={`h-36 bg-gradient-to-br ${s.bg} flex items-center justify-center relative overflow-hidden`}>
        <span
          className="text-6xl font-extrabold select-none transition-transform duration-300 group-hover:scale-110"
          style={{ color: s.accent, opacity: 0.9 }}
        >
          {initial}
        </span>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2.5 rounded-xl bg-red-500/40 hover:bg-red-500/60 backdrop-blur-sm transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-semibold text-foreground capitalize text-sm leading-snug">
            {portfolio.templateName?.replace(/-/g, " ")}
          </p>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground whitespace-nowrap shrink-0">
            {dateStr}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">AI Generated Portfolio</p>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="flex-1 h-8 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            View
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="h-8 px-2 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
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
      .catch(() => toast({ title: "Could not load portfolios", description: "Try refreshing the page.", variant: "destructive" }))
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

  const recentPortfolios = portfolios.slice(0, 3);
  const totalCount  = portfolios.length;
  const credits     = user?.credits ?? 0;
  const firstName   = user?.name?.split(" ")[0] ?? "there";

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
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">

        {/* Hero banner */}
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
              <h1 className="text-2xl font-extrabold mb-1.5 leading-tight">
                Hello, {firstName}! 👋
              </h1>
              <p className="text-white/75 max-w-md text-sm leading-relaxed">
                Your AI-powered portfolio workspace. Use your credits to generate professional
                portfolios from your resume in under a minute.
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

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Zap,
              value: <span className={credits === 0 ? "text-destructive" : credits <= 2 ? "text-amber-500" : "text-foreground"}>{credits}</span>,
              label: "Credits Left",
              sub: "Resets every 24 hours",
              extra: (
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(credits / 5) * 100}%`,
                      background: credits === 0 ? "#ef4444" : credits <= 2 ? "#f59e0b" : "linear-gradient(90deg, #6366f1, #22c55e)",
                    }}
                  />
                </div>
              ),
            },
            {
              icon: ImageIcon,
              value: <span>{totalCount}</span>,
              label: "Portfolios Made",
              sub: "Total generated so far",
            },
            {
              icon: Clock,
              value: <span className="text-sm font-semibold">{lastActivity}</span>,
              label: "Last Activity",
              sub: null,
            },
            {
              icon: CalendarDays,
              value: <span className="text-sm font-semibold">{memberSince}</span>,
              label: "Member Since",
              sub: null,
            },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-elevated transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-2xl font-extrabold text-foreground">{stat.value}</span>
              </div>
              <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold mb-0.5">{stat.label}</p>
              {stat.sub && <p className="text-[10px] text-muted-foreground">{stat.sub}</p>}
              {stat.extra}
            </div>
          ))}
        </div>

        {/* Recent Portfolios */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Recent Portfolios</h2>
            {totalCount > 3 && (
              <Link to="/history" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl border border-border h-56 animate-pulse" />
              ))}
            </div>
          ) : recentPortfolios.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border border-dashed">
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

      </div>
    </AppLayout>
  );
};

export default DashboardPage;
