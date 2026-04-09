// frontend/src/pages/DashboardPage.tsx
//
// FIX: Portfolio thumbnail cards now show a real coloured gradient
// matching each template's aesthetic instead of a plain grey box.
// Each template ID maps to its own gradient + initial colour.

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { portfolioApi } from "@/lib/api";
import { Sparkles, ImageIcon, Clock, CalendarDays, Pencil, Trash2, ArrowRight, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  _id: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
}

// Thumbnail colour config per template
const TEMPLATE_STYLES: Record<string, { bg: string; initial: string; label: string }> = {
  "glass-terminal":   { bg: "from-[#060a12] to-[#0d2137]",     initial: "text-[#00ff88]",  label: "Glass Terminal"    },
  "brutalist-grid":   { bg: "from-[#0a0a0a] to-[#1a1a1a]",     initial: "text-[#ffdd00]",  label: "Brutalist Grid"    },
  "aurora-luxury":    { bg: "from-[#1a0533] to-[#08090d]",      initial: "text-[#a78bfa]",  label: "Aurora Luxury"     },
  "swiss-precision":  { bg: "from-[#f7f4ef] to-[#ede9e1]",      initial: "text-[#0050ff]",  label: "Swiss Precision"   },
  "obsidian-code":    { bg: "from-[#1e1e2e] to-[#0a0a0a]",      initial: "text-[#cba6f7]",  label: "Obsidian Code"     },
  "kinetic-magazine": { bg: "from-[#faf8f3] to-[#f0ebe0]",      initial: "text-[#c84b11]",  label: "Kinetic Magazine"  },
};

function PortfolioThumbnail({ templateName }: { templateName: string }) {
  const s = TEMPLATE_STYLES[templateName] ?? {
    bg: "from-secondary to-muted",
    initial: "text-muted-foreground/30",
    label: templateName,
  };
  const initial = (templateName?.[0] ?? "P").toUpperCase();

  return (
    <div className={`h-40 bg-gradient-to-br ${s.bg} flex items-center justify-center`}>
      <span className={`text-5xl font-bold ${s.initial} font-display select-none`}>{initial}</span>
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
    portfolioApi.history()
      .then((res) => setPortfolios(res.data.portfolios || []))
      .catch(() => toast({ title: "Error", description: "Could not load portfolios.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this portfolio? This cannot be undone.")) return;
    try {
      await portfolioApi.delete(id);
      setPortfolios((prev) => prev.filter((p) => p._id !== id));
      toast({ title: "Deleted", description: "Portfolio removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const recentPortfolios = portfolios.slice(0, 3);
  const totalCount = portfolios.length;
  const lastActivity = portfolios[0]
    ? new Date(portfolios[0].updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
    : "No activity yet";
  const memberSince = user ? new Date(user.createdAt as any || Date.now()).getFullYear().toString() : new Date().getFullYear().toString();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* Hero + Credits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-primary to-blue-700 p-8 text-white">
            <h1 className="text-3xl font-display font-bold mb-2">
              Welcome, {user?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-white/80 max-w-md mb-6">
              Your AI-powered portfolio workspace. Use your credits to generate professional portfolios from your resume in seconds.
            </p>
            <button
              onClick={() => navigate("/generate")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-primary font-semibold hover:opacity-90 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Generate New Portfolio
            </button>
          </div>

          {/* Credits card */}
          <div className="rounded-2xl bg-card border border-border p-6 flex flex-col items-center justify-center text-center shadow-card">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs tracking-widest text-primary font-semibold uppercase mb-2">Credits Available</p>
            <p className="text-5xl font-display font-bold text-foreground">{user?.credits ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.credits === 0 ? "Resets every 24 hours" : "Each generation uses 1 credit"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: ImageIcon,   label: "TOTAL GENERATED", value: `${totalCount} Portfolio${totalCount !== 1 ? "s" : ""}` },
            { icon: Clock,       label: "LAST ACTIVITY",   value: lastActivity },
            { icon: CalendarDays,label: "MEMBER SINCE",    value: memberSince },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-4 bg-card rounded-xl border border-border p-5 shadow-card">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] tracking-widest text-muted-foreground uppercase">{stat.label}</p>
                <p className="text-lg font-semibold text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Portfolios */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-foreground">Recent Portfolios</h2>
            {totalCount > 3 && (
              <Link to="/history" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border h-64 animate-pulse" />
              ))}
            </div>
          ) : recentPortfolios.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No portfolios yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Generate your first AI portfolio now!</p>
              <button
                onClick={() => navigate("/generate")}
                className="mt-4 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPortfolios.map((p) => (
                <div
                  key={p._id}
                  className="bg-card rounded-xl border border-border overflow-hidden shadow-card hover:shadow-elevated transition-shadow cursor-pointer"
                  onClick={() => navigate(`/preview/${p._id}`)}
                >
                  {/* FIX: Coloured thumbnail instead of grey box */}
                  <PortfolioThumbnail templateName={p.templateName} />

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-foreground capitalize">
                        {p.templateName?.replace(/-/g, " ")}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Template: {p.templateName}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/preview/${p._id}`); }}
                        className="flex-1 h-9 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        View Site
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/editor/${p._id}`); }}
                        className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                        title="Edit HTML"
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                        className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-bold text-foreground mb-4">How the AI Generation Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              ["1", "Upload your resume PDF or paste your resume text"],
              ["2", "Choose from 6 professional portfolio templates"],
              ["3", "Google Gemini AI extracts your details and fills the template"],
              ["4", "Download your portfolio HTML or edit it live"],
            ].map(([step, text]) => (
              <div key={step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {step}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default DashboardPage;