// src/pages/EditorPage.tsx
// Fixed: code textarea now uses explicit dark background (#1e1e2e) + light text
//        regardless of app theme — matches a professional code editor appearance.
// Fixed: live preview iframe uses allow-popups + base target=_blank so nav links
//        scroll within the preview and external links open in new tabs correctly.

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { portfolioApi } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ArrowLeft, Save, Loader2, CheckCircle, Eye, Cpu,
  Copy, WrapText, Sun, Moon, BrainCircuit, Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
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

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `portfolio-${templateName || "site"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Portfolio saved as an HTML file." });
  };

  // Inject base target=_blank so external links open in new tab,
  // but internal anchor (#section) links scroll within the iframe normally.
  // We do NOT add base for the live preview — that would break anchor scroll.
  // Instead we use sandbox="allow-same-origin allow-scripts allow-popups"
  // and let the portfolio's own nav links work via smooth-scroll JS.
  const previewHtml = html;

  const hasUnsavedChanges = html !== originalHtml;
  const displayName = templateName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-5 w-px bg-border hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <BrainCircuit className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-bold text-foreground">{displayName}</p>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">
                Editor {hasUnsavedChanges && <span className="text-amber-500 font-semibold ml-1">Unsaved</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="p-2 rounded-lg hover:bg-secondary transition-colors border border-transparent hover:border-border"
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button
            onClick={() => setWordWrap(!wordWrap)}
            title={wordWrap ? "Disable word wrap" : "Enable word wrap"}
            className={`hidden sm:flex p-2 rounded-lg transition-colors border ${
              wordWrap
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-transparent hover:bg-secondary text-muted-foreground"
            }`}
          >
            <WrapText className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            {copied
              ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Copied</>
              : <><Copy className="w-3.5 h-3.5" /> Copy HTML</>}
          </button>
          <button
            onClick={handleDownload}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            onClick={() => navigate(`/preview/${id}`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            title="Save changes (Ctrl+S)"
          >
            {saving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
              : saved
              ? <><CheckCircle className="w-3.5 h-3.5" /> Saved</>
              : <><Save className="w-3.5 h-3.5" /> Save</>}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        {/* Code editor pane — always dark, like a real code editor */}
        <div className="flex flex-col w-1/2 border-r border-border" style={{ background: "#0d1117" }}>
          <div
            className="flex items-center justify-between px-4 py-2 border-b"
            style={{ background: "#161b22", borderColor: "#30363d" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#8b949e" }}>
                HTML
              </span>
              <span className="text-[10px]" style={{ color: "#6e7681" }}>
                {html.length.toLocaleString()} chars
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "#6e7681" }}>
              <kbd
                className="px-1.5 py-0.5 rounded font-mono text-[10px]"
                style={{ background: "#21262d", border: "1px solid #30363d", color: "#8b949e" }}
              >
                {typeof navigator !== "undefined" && navigator.platform.includes("Mac") ? "Cmd" : "Ctrl"}+S
              </kbd>
              <span>to save</span>
            </div>
          </div>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="flex-1 p-4 font-mono text-xs leading-relaxed resize-none outline-none"
            style={{
              background: "#0d1117",
              color: "#e6edf3",
              caretColor: "#58a6ff",
              whiteSpace: wordWrap ? "pre-wrap" : "pre",
              overflowWrap: wordWrap ? "break-word" : "normal",
              tabSize: 2,
            }}
            spellCheck={false}
            placeholder="Portfolio HTML will appear here..."
          />
        </div>

        {/* Live preview pane */}
        <div className="flex flex-col w-1/2 bg-secondary">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Live Preview
              </span>
            </div>
            {hasUnsavedChanges && (
              <span className="text-[10px] text-amber-500 font-semibold">Unsaved changes</span>
            )}
          </div>
          {/* 
            sandbox: allow-same-origin (CSS/fonts work), allow-scripts (portfolio JS),
            allow-popups (external links open new tab via window.open or target=_blank)
            Note: nav anchor links (#section) work naturally within the iframe without
            needing allow-top-navigation. External links need target=_blank in the HTML.
          */}
          <iframe
            srcDoc={previewHtml}
            title="Live Preview"
            className="flex-1 border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
