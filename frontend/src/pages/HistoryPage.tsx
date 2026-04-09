import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { portfolioApi } from "@/lib/api";
import { Eye, Pencil, Trash2, Sparkles, Archive, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  _id: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
}

const HistoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "drafts" | "published">("all");

  useEffect(() => {
    portfolioApi.history()
      .then((res) => setPortfolios(res.data.portfolios || []))
      .catch(() => toast({ title: "Error", description: "Failed to load history.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleDelete = async (id: string) => {
    try {
      await portfolioApi.delete(id);
      setPortfolios((p) => p.filter((x) => x._id !== id));
      toast({ title: "Deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-4">
          <div>
            <p className="text-xs tracking-widest text-primary font-semibold uppercase">History Archive</p>
            <h1 className="text-3xl font-display font-bold text-foreground mt-1">Your Portfolio History</h1>
            <p className="text-muted-foreground mt-1">Review, manage, and export your AI-generated portfolio projects.</p>
          </div>
          <div className="flex gap-2">
            {(["all", "drafts", "published"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-secondary"
                }`}
              >
                {f === "all" ? "All Projects" : f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-card rounded-xl border border-border animate-pulse" />)}
          </div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <Archive className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No portfolios found.</p>
            <button
              onClick={() => navigate("/generate")}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              Generate your first
            </button>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Template", "Created", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] tracking-widest text-muted-foreground uppercase font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {portfolios.map((p) => (
                  <tr key={p._id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-muted" />
                        <div>
                          <p className="font-semibold text-sm text-foreground capitalize">{p.templateName}</p>
                          <p className="text-xs text-muted-foreground">Portfolio Layout</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-foreground">
                        {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-success/30 text-success uppercase">
                        Live
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate(`/preview/${p._id}`)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => navigate(`/editor/${p._id}`)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Insights */}
        {portfolios.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
            <div className="lg:col-span-2 rounded-2xl bg-gradient-hero p-8 text-primary-foreground">
              <p className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-2">Curator Insights</p>
              <p className="text-xl font-bold mb-2">You've generated {portfolios.length} portfolio{portfolios.length !== 1 ? "s" : ""} so far.</p>
              <p className="text-sm text-primary-foreground/80">Keep building your collection. Each template adapts AI-generated content to match its unique style.</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <p className="font-bold text-foreground">Automated Archives</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Projects older than 90 days are automatically optimized for storage. You can restore them anytime.
              </p>
              <button className="text-sm text-primary font-medium mt-3 flex items-center gap-1 hover:underline">
                Access Deep Vault <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HistoryPage;
