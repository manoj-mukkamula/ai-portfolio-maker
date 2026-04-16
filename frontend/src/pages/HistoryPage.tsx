// src/pages/HistoryPage.tsx
// Fixed: portfolioApi.history() (was incorrectly .getAll())
// Filters: All / Recent (7d) / Starred | Search | Delete dialog | Larger text

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { portfolioApi } from "@/lib/api";
import {
  Eye, Pencil, Trash2, Sparkles, Clock, Star,
  LayoutGrid, AlertTriangle, X, Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  _id: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATE_META: Record<string, { bg: string; color: string; label: string }> = {
  "glass-terminal":   { bg: "#060a12", color: "#00ff88", label: "Glass Terminal"   },
  "brutalist-grid":   { bg: "#0a0a0a", color: "#ffdd00", label: "Brutalist Grid"   },
  "aurora-luxury":    { bg: "#1a0533", color: "#a78bfa", label: "Aurora Luxury"    },
  "swiss-precision":  { bg: "#f7f4ef", color: "#0050ff", label: "Swiss Precision"  },
  "obsidian-code":    { bg: "#1e1e2e", color: "#cba6f7", label: "Obsidian Code"    },
  "kinetic-magazine": { bg: "#faf8f3", color: "#c84b11", label: "Kinetic Magazine" },
  "deep-dark-minimal": { bg: "#090910", color: "#4f8ef7", label: "Deep Dark Minimal" },
};

type Filter = "all" | "recent" | "starred";

const getFavorites = (): Set<string> => {
  try {
    const raw = localStorage.getItem("portfolio_favorites");
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
};
const saveFavorites = (favs: Set<string>) => {
  localStorage.setItem("portfolio_favorites", JSON.stringify([...favs]));
};

const DeleteDialog = ({
  name, onConfirm, onCancel,
}: { name: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-card border border-border rounded-2xl shadow-modal w-full max-w-md mx-4 p-7 animate-slide-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-base">Delete Portfolio</h3>
          <p className="text-sm text-muted-foreground mt-0.5">This cannot be undone</p>
        </div>
        <button onClick={onCancel} className="ml-auto p-2 rounded-xl hover:bg-secondary transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <p className="text-base text-muted-foreground mb-7 leading-relaxed">
        Are you sure you want to permanently delete the{" "}
        <span className="font-semibold text-foreground">{name}</span> portfolio?
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-border text-base font-medium text-foreground hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-destructive text-white text-base font-semibold hover:opacity-90 transition-opacity"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const HistoryPage = () => {
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<Filter>("all");
  const [search, setSearch]         = useState("");
  const [favorites, setFavorites]   = useState<Set<string>>(getFavorites);
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    portfolioApi
      .history()                                          // ← FIXED: was .getAll()
      .then((res) => setPortfolios(res.data.portfolios ?? []))
      .catch(() => toast({ title: "Could not load history", description: "Try refreshing the page.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const toggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveFavorites(next);
      return next;
    });
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await portfolioApi.delete(deleteTarget._id);
      setPortfolios((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      toast({ title: "Portfolio deleted" });
    } catch {
      toast({ title: "Could not delete", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const isRecent = (createdAt: string) =>
    Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;

  const filtered = portfolios.filter((p) => {
    if (filter === "recent"  && !isRecent(p.createdAt))  return false;
    if (filter === "starred" && !favorites.has(p._id))   return false;
    if (search.trim()) {
      const label = TEMPLATE_META[p.templateName]?.label ?? p.templateName;
      if (!label.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: "all",     label: "All",     count: portfolios.length },
    { key: "recent",  label: "Recent",  count: portfolios.filter((p) => isRecent(p.createdAt)).length },
    { key: "starred", label: "Starred", count: favorites.size },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-9">
          <p className="text-xs tracking-widest text-primary font-semibold uppercase">Portfolio History</p>
          <h1 className="text-4xl font-extrabold text-foreground mt-1.5 tracking-tight">Your Portfolios</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Browse, preview, edit, or delete your generated portfolios.
          </p>
        </div>

        {/* Stats */}
        {!loading && portfolios.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              { label: "Total",     value: portfolios.length, color: "#6366f1", icon: LayoutGrid },
              { label: "This week", value: portfolios.filter((p) => isRecent(p.createdAt)).length, color: "#10b981", icon: Sparkles },
              { label: "Starred",   value: favorites.size, color: "#f59e0b", icon: Star },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-card">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}18` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground leading-tight">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex gap-1 p-1 bg-secondary rounded-xl">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === f.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  filter === f.key ? "bg-primary/15 text-primary" : "bg-border/80 text-muted-foreground"
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by template..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Portfolio list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-5">
              {filter === "starred"
                ? <Star className="w-8 h-8 text-muted-foreground" />
                : <LayoutGrid className="w-8 h-8 text-muted-foreground" />}
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">
              {filter === "starred" ? "No starred portfolios" : filter === "recent" ? "Nothing this week" : "No portfolios found"}
            </p>
            <p className="text-base text-muted-foreground">
              {filter === "starred"
                ? "Click the star on any portfolio to bookmark it here."
                : filter === "recent"
                ? "Portfolios you generate this week will appear here."
                : "Generate your first portfolio to see it listed here."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => {
              const meta    = TEMPLATE_META[p.templateName] ?? { bg: "#1a1a2e", color: "#6366f1", label: p.templateName };
              const dateStr = new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
              const timeStr = new Date(p.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
              const starred = favorites.has(p._id);

              return (
                <div
                  key={p._id}
                  className="group bg-card border border-border rounded-2xl flex items-center gap-4 p-4 hover:border-primary/25 hover:shadow-card transition-all cursor-pointer"
                  onClick={() => navigate(`/preview/${p._id}`)}
                >
                  {/* Template swatch */}
                  <div
                    className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-lg font-extrabold select-none"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.label[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground truncate">{meta.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">{dateStr} at {timeStr}</span>
                      {isRecent(p.createdAt) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-semibold">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => toggleFavorite(p._id, e)}
                      className={`p-2.5 rounded-xl transition-colors ${
                        starred ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                      }`}
                      title={starred ? "Remove from starred" : "Add to starred"}
                    >
                      <Star className="w-4 h-4" fill={starred ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/editor/${p._id}`); }}
                      className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                      className="p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mobile fallback */}
                  <Eye className="w-5 h-5 text-muted-foreground group-hover:hidden flex-shrink-0 sm:hidden" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteDialog
          name={TEMPLATE_META[deleteTarget.templateName]?.label ?? deleteTarget.templateName}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AppLayout>
  );
};

export default HistoryPage;
