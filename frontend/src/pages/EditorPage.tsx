// src/pages/EditorPage.tsx
//
// FIX: sandbox changed from "allow-same-origin" to "allow-same-origin allow-scripts"
// on the live preview iframe. Without allow-scripts, all inline <script> blocks
// in the portfolio are blocked and the live preview shows empty sections —
// identical to the bug in PreviewPage. The editor itself is unaffected.

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { portfolioApi } from "@/lib/api";
import { ArrowLeft, Save, Loader2, CheckCircle, Eye, Cpu } from "lucide-react";
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

  const displayName = templateName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="h-5 w-px bg-border hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="leading-none">
              <p className="font-bold text-sm text-foreground">{displayName}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                HTML Editor
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/preview/${id}`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </span>
          )}

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

      {/* ── Editor + Preview panes ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left: code editor */}
        <div className="lg:w-1/2 flex flex-col border-r border-border">
          <div className="px-4 py-2 border-b border-border bg-secondary/50 flex items-center gap-2 shrink-0">
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider ml-1">
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

        {/* Right: live preview */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="px-4 py-2 border-b border-border bg-secondary/50 flex items-center gap-2 shrink-0">
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              Live Preview — {displayName}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                Live
              </span>
            </div>
          </div>
          {/*
            FIX: "allow-scripts" added. Without it, all inline <script> blocks
            inside the portfolio template are blocked by the browser's iframe
            sandbox. Skills, Projects, Experience, Education sections all
            populate via JS and appear empty without this flag.
          */}
          <iframe
            srcDoc={html}
            title="Live Preview"
            className="flex-1 w-full border-0 min-h-[50vh]"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <footer className="h-8 shrink-0 flex items-center justify-between px-4 border-t border-border bg-card text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Live preview active — scripts enabled
        </span>
        <span className="hidden sm:inline">
          Edit the HTML on the left and see changes in real time
        </span>
      </footer>
    </div>
  );
};

export default EditorPage;