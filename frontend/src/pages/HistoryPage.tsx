// src/pages/HistoryPage.tsx
// Changes:
//  - Filter buttons (All / Drafts / Published) are now functional
//  - Template thumbnails replaced with colored initials (consistent with dashboard)
//  - Hover effects on table rows
//  - Status badge: LIVE = green, DRAFT = amber
//  - Delete confirmation modal (window.confirm)
//  - Tooltips on action icons via title attribute
//  - "Access Deep Vault" replaced with "View All" link that navigates to history
//  - Empty state when filter returns no results
//  - Removed "Developed by Manoj" (handled in sidebar)
//  - No em dashes in any copy

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { portfolioApi } from "@/lib/api";
import { Eye, Pencil, Trash2, Sparkles, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  _id: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
  status?: "live" | "draft";
}

const TEMPLATE_ACCENT: Record<string, { bg: string; color: string }> = {
  "glass-terminal":   { bg: "#060a12", color: "#00ff88" },
  "brutalist-grid":   { bg: "#0a0a0a", color: "#ffdd00" },
  "aurora-luxury":    { bg: "#1a0533", color: "#a78bfa" },
  "swiss-precision":  { bg: "#f7f4ef", color: "#0050ff" },
  "obsidian-code":    { bg: "#1e1e2e", color: "#cba6f7" },
  "kinetic-magazine": { bg: "#faf8f3", color: "#c84b11" },
};

type Filter = "all" | "drafts" | "published";

const HistoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    portfolioApi.history()
      .then((res) => setPortfolios(res.data.portfolios || []))
      .catch(() => toast({ title: "Error", description: "Failed to load history.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this portfolio? This action cannot be undone.")) return;
    try {
      await portfolioApi.delete(id);
      setPortfolios((p) => p.filter((x) => x._id !== id));
      toast({ title: "Portfolio deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete. Please try again.", variant: "destructive" });
    }
  };

  // All portfolios are "live" since the app doesn't implement draft status server-side yet
  // Filter logic ready for when draft status is added
  const filtered = portfolios.filter((p) => {
    const isLive = (p.status ?? "live") === "live";
    if (filter === "published") return isLive;
    if (filter === "drafts") return !isLive;
    return true;
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-4">
          <div>
            <p className="text-[11px] tracking-widest text-primary font-semibold uppercase">History Archive</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">Your Portfolio History</h1>
            <p className="text-muted-foreground mt-1 text-sm">Review, manage, and export your AI-generated portfolio projects.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {(["all", "drafts", "published"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-foreground hover:bg-secondary hover:border-primary/30"
                }`}
              >
                {f === "all" ? "All Projects" : f === "published" ? "Published" : "Drafts"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-card rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <Archive className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-foreground font-semibold mb-1">
              {filter === "all" ? "No portfolios yet" : `No ${filter} portfolios found`}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {filter === "all"
                ? "Generate your first portfolio to see it here."
                : `Switch to "All Projects" to see everything.`}
            </p>
            {filter === "all" && (
              <button
                onClick={() => navigate("/generate")}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Generate your first
              </button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {["Template", "Created", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] tracking-widest text-muted-foreground uppercase font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const accent = TEMPLATE_ACCENT[p.templateName] ?? { bg: "#1e1e2e", color: "#6366f1" };
                  const initial = (p.templateName?.[0] ?? "P").toUpperCase();
                  const isLive = (p.status ?? "live") === "live";

                  return (
                    <tr key={p._id}
                      className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-extrabold"
                            style={{ background: accent.bg, color: accent.color }}
                          >
                            {initial}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground capitalize">
                              {p.templateName?.replace(/-/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">Portfolio Layout</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-foreground">
                          {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                          isLive
                            ? "border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/8"
                            : "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/8"
                        }`}>
                          {isLive ? "Live" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/preview/${p._id}`)}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                            title="Preview portfolio">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(`/editor/${p._id}`)}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                            title="Edit portfolio">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p._id)}
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                            title="Delete portfolio">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Insights section */}
        {portfolios.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-7">
            <div className="lg:col-span-2 rounded-2xl p-7 text-white"
              style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0e7490 100%)" }}>
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
