// src/pages/EditorPage.tsx
// Live HTML editor for a generated portfolio.
// Left panel: editable HTML textarea. Right panel: live iframe preview.
// Save button persists changes to MongoDB via PUT /api/portfolio/:id.

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { portfolioApi } from "@/lib/api";
import { ArrowLeft, Save, Loader2, CheckCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // Load portfolio HTML on mount
  useEffect(() => {
    if (!id) return;
    portfolioApi
      .getOne(id)
      .then((res) => {
        setHtml(res.data.portfolio.html);
        setTemplateName(res.data.portfolio.templateName || "portfolio");
      })
      .catch(() =>
        toast({ title: "Error", description: "Portfolio not found.", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, [id, toast]);

  // Save HTML changes to backend
  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await portfolioApi.update(id, { html });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast({ title: "Saved", description: "Changes saved successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top header bar */}
      <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <p className="font-display font-bold text-foreground capitalize">
              {templateName.replace(/-/g, " ")}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              HTML Editor — AI Portfolio Maker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview button */}
          <button
            onClick={() => navigate(`/preview/${id}`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>

          {/* Save indicator */}
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </span>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Changes
          </button>
        </div>
      </header>

      {/* Editor + Preview panes */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Code editor */}
        <div className="lg:w-1/2 flex flex-col border-r border-border">
          <div className="px-4 py-2 border-b border-border bg-secondary/50 flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              HTML
            </span>
            <span className="text-xs text-muted-foreground">index.html</span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {html.length.toLocaleString()} chars
            </span>
          </div>
          <textarea
            value={html}
            onChange={(e) => {
              setHtml(e.target.value);
              setSaved(false);
            }}
            className="flex-1 p-4 font-mono text-sm bg-[hsl(222,47%,6%)] text-[hsl(210,40%,90%)] resize-none outline-none min-h-[50vh] leading-relaxed"
            spellCheck={false}
            aria-label="HTML editor"
          />
        </div>

        {/* Right: Live preview */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="px-4 py-2 border-b border-border flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              Live Preview — {templateName}
            </span>
          </div>
          <iframe
            srcDoc={html}
            title="Live Preview"
            className="flex-1 w-full border-0 min-h-[50vh]"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* Bottom status bar */}
      <footer className="flex items-center justify-between px-4 py-2 border-t border-border bg-card text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Live preview active
          </span>
        </div>
        <span>Tip: Edit the HTML on the left and see changes in real time</span>
      </footer>
    </div>
  );
};

export default EditorPage;