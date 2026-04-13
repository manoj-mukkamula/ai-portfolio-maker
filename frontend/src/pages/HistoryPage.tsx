// src/pages/HistoryPage.tsx
// Updates:
//  - Filters replaced: "Recent" (last 7 days), "All" (everything), "Favorites" (starred)
//  - Star/favorite toggle per portfolio stored in localStorage
//  - Empty state per filter is meaningful and helpful
//  - Improved visual design with card-style table rows
//  - Delete uses a proper confirmation dialog (not window.confirm)
//  - Stats summary at top

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { portfolioApi } from "@/lib/api";
import { Eye, Pencil, Trash2, Sparkles, Clock, Star, LayoutGrid, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  _id: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATE_ACCENT: Record<string, { bg: string; color: string }> = {
  "glass-terminal":   { bg: "#060a12", color: "#00ff88" },
  "brutalist-grid":   { bg: "#0a0a0a", color: "#ffdd00" },
  "aurora-luxury":    { bg: "#1a0533", color: "#a78bfa" },
  "swiss-precision":  { bg: "#f7f4ef", color: "#0050ff" },
  "obsidian-code":    { bg: "#1e1e2e", color: "#cba6f7" },
  "kinetic-magazine": { bg: "#faf8f3", color: "#c84b11" },
};

type Filter = "all" | "recent" | "favorites";

// Favorites stored in localStorage
const getFavorites = (): Set<string> => {
  try {
    const raw = localStorage.getItem("portfolio_favorites");
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const saveFavorites = (favs: Set<string>) => {
  localStorage.setItem("portfolio_favorites", JSON.stringify([...favs]));
};

// Delete Confirmation Dialog
const DeleteDialog = ({
  portfolioName,
  onConfirm,
  onCancel,
}: {
  portfolioName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-card border border-border rounded-2xl shadow-modal w-full max-w-sm mx-4 p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Delete Portfolio</h3>
          <p className="text-xs text-muted-foreground">This action cannot be undone</p>
        </div>
        <button onClick={onCancel} className="ml-auto p-1 rounded-lg hover:bg-secondary transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Are you sure you want to delete the{" "}
        <span className="font-semibold text-foreground capitalize">{portfolioName.replace(/-/g, " ")}</span>{" "}
        portfolio? This will remove it permanently.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex-1 h-9 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
        >
          Keep it
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 h-9 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all"
        >
          Yes, delete
        </button>
      </div>
    </div>
  </div>
);

const isRecent = (dateStr: string) => {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return new Date(dateStr).getTime() > sevenDaysAgo;
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [favorites, setFavorites] = useState<Set<string>>(getFavorites);
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);

  useEffect(() => {
    portfolioApi
      .history()
      .then((res) => setPortfolios(res.data.portfolios || []))
      .catch(() => toast({ title: "Error", description: "Failed to load history.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveFavorites(next);
      return next;
    });
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await portfolioApi.delete(deleteTarget._id);
      setPortfolios((p) => p.filter((x) => x._id !== deleteTarget._id));
      // Remove from favorites if it was there
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget._id);
        saveFavorites(next);
        return next;
      });
      toast({ title: "Portfolio deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete. Please try again.", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = portfolios.filter((p) => {
    if (filter === "recent") return isRecent(p.createdAt);
    if (filter === "favorites") return favorites.has(p._id);
    return true;
  });

  const recentCount = portfolios.filter((p) => isRecent(p.createdAt)).length;
  const favCount = favorites.size;

  const FILTERS: { key: Filter; label: string; count: number; icon: React.ElementType }[] = [
    { key: "all",       label: "All Portfolios", count: portfolios.length, icon: LayoutGrid },
    { key: "recent",    label: "Recent",          count: recentCount,       icon: Clock     },
    { key: "favorites", label: "Favorites",       count: favCount,          icon: Star      },
  ];

  const emptyMessages: Record<Filter, { title: string; sub: string; showCTA: boolean }> = {
    all:       { title: "No portfolios yet",          sub: "Generate your first AI portfolio to see it here.",          showCTA: true  },
    recent:    { title: "No recent portfolios",       sub: "Nothing generated in the last 7 days. Ready to make one?",  showCTA: true  },
    favorites: { title: "No favorites yet",           sub: "Star any portfolio to save it here for quick access.",       showCTA: false },
  };

  const empty = emptyMessages[filter];

  return (
    <AppLayout>
      {deleteTarget && (
        <DeleteDialog
          portfolioName={deleteTarget.templateName}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-4">
          <div>
            <p className="text-[11px] tracking-widest text-primary font-semibold uppercase">History Archive</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">Your Portfolios</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Review, manage, and revisit your AI-generated portfolio projects.
            </p>
          </div>

          {/* Summary pills */}
          {!loading && portfolios.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-3 py-1.5 bg-card border border-border rounded-lg font-medium">
                {portfolios.length} total
              </span>
              <span className="px-3 py-1.5 bg-card border border-border rounded-lg font-medium">
                {recentCount} this week
              </span>
              <span className="px-3 py-1.5 bg-card border border-border rounded-lg font-medium">
                {favCount} starred
              </span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5 border-b border-border pb-3">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <f.icon className="w-3.5 h-3.5" />
              {f.label}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  filter === f.key ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
            {filter === "favorites"
              ? <Star className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              : filter === "recent"
              ? <Clock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              : <LayoutGrid className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />}
            <p className="text-foreground font-semibold mb-1">{empty.title}</p>
            <p className="text-sm text-muted-foreground mb-4">{empty.sub}</p>
            {empty.showCTA && (
              <button
                onClick={() => navigate("/generate")}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Generate a portfolio
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => {
              const accent = TEMPLATE_ACCENT[p.templateName] ?? { bg: "#1e1e2e", color: "#6366f1" };
              const initial = (p.templateName?.[0] ?? "P").toUpperCase();
              const isFav = favorites.has(p._id);
              const recent = isRecent(p.createdAt);

              return (
                <div
                  key={p._id}
                  className="flex items-center gap-4 px-4 py-4 bg-card rounded-xl border border-border hover:border-primary/20 hover:shadow-elevated transition-all duration-200 group"
                >
                  {/* Template avatar */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-sm font-extrabold"
                    style={{ background: accent.bg, color: accent.color }}
                  >
                    {initial}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground capitalize">
                        {p.templateName?.replace(/-/g, " ")}
                      </p>
                      {recent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(p.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(p.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {/* Star/Favorite */}
                    <button
                      onClick={() => toggleFavorite(p._id)}
                      title={isFav ? "Remove from favorites" : "Add to favorites"}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Star
                        className="w-4 h-4 transition-colors"
                        style={{ color: isFav ? "#f59e0b" : undefined }}
                        fill={isFav ? "#f59e0b" : "none"}
                      />
                    </button>
                    <button
                      onClick={() => navigate(`/preview/${p._id}`)}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                      title="Preview portfolio"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/editor/${p._id}`)}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                      title="Edit portfolio"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      title="Delete portfolio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Insights */}
        {portfolios.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-7">
            <div
              className="lg:col-span-2 rounded-2xl p-7 text-white"
              style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0e7490 100%)" }}
            >
              <p className="text-xs uppercase tracking-widest text-white/60 mb-2">Curator Insights</p>
              <p className="text-xl font-bold mb-2">
                You've generated {portfolios.length} portfolio{portfolios.length !== 1 ? "s" : ""} so far.
              </p>
              <p className="text-sm text-white/75">
                Keep building your collection. Each template adapts AI-generated content to match its unique style.
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="font-bold text-foreground text-sm">Storage Info</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Your portfolios are stored securely and available anytime. You can preview, edit, or download them as HTML files.
              </p>
              <button
                onClick={() => navigate("/generate")}
                className="text-sm text-primary font-medium mt-3 hover:underline transition-colors"
              >
                Generate a new one
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HistoryPage;
