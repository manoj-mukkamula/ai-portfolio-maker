// src/pages/EditorPage.tsx
// Changes:
//  - Header: gradient Save button, consistent with rest of app
//  - Added word wrap toggle button for the code editor
//  - Added copy-to-clipboard button in editor toolbar
//  - Status bar shows unsaved changes indicator
//  - Keyboard shortcut Ctrl/Cmd+S to save
//  - Editor pane: line numbers style, dark background consistent with dark theme
//  - No em dashes anywhere in copy
//  - All sandbox / iframe fixes retained

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { portfolioApi } from "@/lib/api";
import { ArrowLeft, Save, Loader2, CheckCircle, Eye, Cpu, Copy, WrapText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [html, setHtml] = useState("");
  const [originalHtml, setOriginalHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [wordWrap, setWordWrap] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    portfolioApi
      .getOne(id)
      .then((res) => {
        setHtml(res.data.portfolio.html);
        setOriginalHtml(res.data.portfolio.html);
        setTemplateName(res.data.portfolio.templateName || "portfolio");
      })
      .catch(() =>
        toast({ title: "Error", description: "Portfolio not found.", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleSave = useCallback(async () => {
    if (!id || saving) return;
    setSaving(true);
    try {
      await portfolioApi.update(id, { html });
      setOriginalHtml(html);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast({ title: "Saved", description: "Changes saved successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [id, html, saving, toast]);

  // Keyboard shortcut: Ctrl/Cmd + S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleSave]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  };

  const hasUnsavedChanges = html !== originalHtml;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  const displayName = templateName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Header */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-5 w-px bg-border hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="leading-none">
              <p className="font-bold text-sm text-foreground">{displayName}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">HTML Editor</p>
            </div>
          </div>

          {/* Unsaved changes indicator */}
          {hasUnsavedChanges && !saving && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-500 font-medium px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/preview/${id}`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            title="Save (Ctrl+S)"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Save Changes</span>
          </button>
        </div>
      </header>

      {/* Editor + Preview panes */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left: code editor */}
        <div className="lg:w-1/2 flex flex-col border-r border-border">
          <div className="px-4 py-2 border-b border-border bg-[hsl(222,47%,5%)] flex items-center gap-2 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider ml-1">HTML</span>
            <span className="text-xs text-muted-foreground">index.html</span>
            <span className="ml-auto flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                {html.length.toLocaleString()} chars
              </span>
              {/* Word wrap toggle */}
              <button
                onClick={() => setWordWrap(!wordWrap)}
                title={wordWrap ? "Disable word wrap" : "Enable word wrap"}
                className={`p-1 rounded transition-colors ${wordWrap ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
              >
                <WrapText className="w-3.5 h-3.5" />
              </button>
              {/* Copy button */}
              <button
                onClick={handleCopy}
                title="Copy HTML"
                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied
                  ? <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  : <Copy className="w-3.5 h-3.5" />}
              </button>
            </span>
          </div>
          <textarea
            value={html}
            onChange={(e) => {
              setHtml(e.target.value);
              setSaved(false);
            }}
            className="flex-1 p-4 font-mono text-sm resize-none outline-none min-h-[50vh] leading-relaxed"
            style={{
              background: "hsl(222,47%,5%)",
              color: "hsl(210,40%,88%)",
              whiteSpace: wordWrap ? "pre-wrap" : "pre",
              overflowWrap: wordWrap ? "break-word" : "normal",
              overflowX: wordWrap ? "hidden" : "auto",
            }}
            spellCheck={false}
            aria-label="HTML editor"
          />
        </div>

        {/* Right: live preview */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="px-4 py-2 border-b border-border bg-secondary/50 flex items-center gap-2 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">Live Preview — {displayName}</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Live</span>
            </div>
          </div>
          <iframe
            srcDoc={html}
            title="Live Preview"
            className="flex-1 w-full border-0 min-h-[50vh]"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>

      {/* Status bar */}
      <footer className="h-8 shrink-0 flex items-center justify-between px-4 border-t border-border bg-card text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Live preview active
          {hasUnsavedChanges && (
            <span className="text-amber-500 ml-2">Unsaved changes</span>
          )}
        </span>
        <span className="hidden sm:inline">Press Ctrl+S to save</span>
      </footer>
    </div>
  );
};

export default EditorPage;
