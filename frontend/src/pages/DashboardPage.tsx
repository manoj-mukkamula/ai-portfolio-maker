// src/pages/DashboardPage.tsx
// Fixed: portfolioApi.history() (was incorrectly .getAll())
// Premium SaaS dashboard with welcome banner, stats, and portfolio cards

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { portfolioApi } from "@/lib/api";
import {
  Sparkles, Clock, Pencil, Trash2, ArrowRight,
  Zap, Eye, Plus, BrainCircuit, LayoutGrid, TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  _id: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATE_STYLES: Record<string, { bg: string; accent: string; label: string }> = {
  "glass-terminal":     { bg: "from-[#060a12] to-[#0d2137]",  accent: "#00ff88",  label: "Glass Terminal"    },
  "brutalist-grid":     { bg: "from-[#0a0a0a] to-[#1a1a1a]",  accent: "#ffdd00",  label: "Brutalist Grid"    },
  "aurora-luxury":      { bg: "from-[#1a0533] to-[#08090d]",   accent: "#a78bfa",  label: "Aurora Luxury"     },
  "swiss-precision":    { bg: "from-[#f7f4ef] to-[#ede9e1]",   accent: "#0050ff",  label: "Swiss Precision"   },
  "obsidian-code":      { bg: "from-[#1e1e2e] to-[#0a0a0a]",   accent: "#cba6f7",  label: "Obsidian Code"     },
  "kinetic-magazine":   { bg: "from-[#faf8f3] to-[#f0ebe0]",   accent: "#c84b11",  label: "Kinetic Magazine"  },
  "deep-dark-minimal":  { bg: "from-[#090910] to-[#0f0f1a]",   accent: "#4f8ef7",  label: "Deep Dark Minimal" },
  "clean-light-unique": { bg: "from-[#fafaf9] to-[#e8e5e0]",   accent: "#2563eb",  label: "Clean Light Unique"},
  "aurora-studio":      { bg: "from-[#f7f6f2] to-[#ece8df]",   accent: "#6366f1",  label: "Aurora Studio"     },
  "vanta-pro":          { bg: "from-[#08080a] to-[#111118]",    accent: "#818cf8",  label: "Vanta Pro"         },
};

function PortfolioCard({
  portfolio, onPreview, onEdit, onDelete,
}: {
  portfolio: Portfolio;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const s = TEMPLATE_STYLES[portfolio.templateName] ?? {
    bg: "from-secondary to-muted", accent: "#6366f1", label: portfolio.templateName,
  };
  const initial = (portfolio.templateName?.[0] ?? "P").toUpperCase();
  const dateStr = new Date(portfolio.createdAt).toLocaleDateString("en-IN", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div
      className="group bg-card rounded-2xl border border-border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated hover:border-primary/25"
      onClick={onPreview}
    >
      {/* Thumbnail */}
      <div className={`h-36 bg-gradient-to-br ${s.bg} flex items-center justify-center relative overflow-hidden`}>
        <span
          className="text-6xl font-extrabold select-none transition-transform duration-300 group-hover:scale-110"
          style={{ color: s.accent, opacity: 0.85 }}
        >
          {initial}
        </span>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="p-2.5 rounded-xl bg-white/20 hover:bg-white/35 backdrop-blur-sm transition-colors"
            title="Preview"
          >
            <Eye className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2.5 rounded-xl bg-white/20 hover:bg-white/35 backdrop-blur-sm transition-colors"
            title="Edit"
          >
            <Pencil className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={onDelete}
            className="p-2.5 rounded-xl bg-red-500/40 hover:bg-red-500/65 backdrop-blur-sm transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-base font-semibold text-foreground leading-tight">{s.label}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{dateStr}</span>
        </div>
      </div>
    </div>
  );
}

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading]       = useState(true);

  const credits    = user?.credits ?? 0;
  const firstName  = user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    portfolioApi
      .history()                                       // ← FIXED: was .getAll()
      .then((res) => setPortfolios(res.data.portfolios ?? []))
      .catch(() => toast({ title: "Could not load portfolios", description: "Try refreshing the page.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this portfolio? This cannot be undone.")) return;
    try {
      await portfolioApi.delete(id);
      setPortfolios((prev) => prev.filter((p) => p._id !== id));
      toast({ title: "Portfolio deleted" });
    } catch {
      toast({ title: "Could not delete portfolio", variant: "destructive" });
    }
  };

  const totalPortfolios = portfolios.length;
  const recentPortfolios = portfolios.slice(0, 6);

  // Find most-used template
  const mostUsed = portfolios.length > 0
    ? Object.entries(
        portfolios.reduce((acc, p) => {
          acc[p.templateName] = (acc[p.templateName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-fade-in space-y-8">

        {/* Welcome banner */}
        <div
          className="rounded-2xl p-8 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #2563eb 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle at 65% 50%, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-white/65 text-xs font-semibold tracking-widest uppercase mb-2">Welcome back</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Hey, {firstName}</h1>
              <p className="text-white/70 text-lg mt-2.5">
                {credits > 0
                  ? `You have ${credits} credit${credits !== 1 ? "s" : ""} available today.`
                  : "Your credits will reset in the next cycle."}
              </p>
            </div>
            <button
              onClick={() => navigate("/generate")}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-indigo-700 font-bold text-base transition-all hover:bg-white/90 active:scale-[0.98] shadow-lg shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-5 h-5" />
              New Portfolio
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: LayoutGrid,
              label: "Total Portfolios",
              value: String(totalPortfolios),
              color: "#6366f1",
              bg: "rgba(99,102,241,0.09)",
            },
            {
              icon: Zap,
              label: "Credits Remaining",
              value: `${credits} / 5`,
              color: credits === 0 ? "#ef4444" : credits <= 2 ? "#f59e0b" : "#10b981",
              bg: credits === 0 ? "rgba(239,68,68,0.09)" : credits <= 2 ? "rgba(245,158,11,0.09)" : "rgba(16,185,129,0.09)",
            },
            {
              icon: TrendingUp,
              label: "Favourite Template",
              value: mostUsed ? (TEMPLATE_STYLES[mostUsed]?.label ?? mostUsed) : "None yet",
              color: "#8b5cf6",
              bg: "rgba(139,92,246,0.09)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 shadow-card"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: stat.bg }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-foreground leading-tight truncate mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent portfolios */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Recent Portfolios</h2>
              {totalPortfolios > 6 && (
                <p className="text-sm text-muted-foreground mt-0.5">Showing 6 of {totalPortfolios}</p>
              )}
            </div>
            {totalPortfolios > 0 && (
              <Link
                to="/history"
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
                  <div className="h-36 bg-secondary" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-4 bg-secondary rounded-lg w-3/4" />
                    <div className="h-3.5 bg-secondary rounded-lg w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            /* Empty state */
            <div className="rounded-2xl border-2 border-dashed border-border bg-card/40 p-14 flex flex-col items-center text-center gap-5">
              <div
                className="w-18 h-18 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <BrainCircuit className="w-9 h-9 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">No portfolios yet</h3>
                <p className="text-base text-muted-foreground max-w-sm leading-relaxed">
                  Upload your resume and Gemini AI will turn it into a professional portfolio site in under a minute.
                </p>
              </div>
              <button
                onClick={() => navigate("/generate")}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <Sparkles className="w-5 h-5" />
                Generate your first portfolio
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
                  onDelete={(e) => handleDelete(p._id, e)}
                />
              ))}
              {/* New portfolio tile */}
              {credits > 0 && recentPortfolios.length < 6 && (
                <button
                  onClick={() => navigate("/generate")}
                  className="rounded-2xl border-2 border-dashed border-border bg-card/50 min-h-[172px] flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-base font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    New portfolio
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
