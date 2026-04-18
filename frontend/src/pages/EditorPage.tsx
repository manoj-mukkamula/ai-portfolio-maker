// src/pages/EditorPage.tsx
// Resizable split panel editor:
//   - Draggable vertical divider (pointer events, smooth, no lag)
//   - Light mode gets a premium warm-tinted code background
//   - Dark mode keeps the classic GitHub-dark look
//   - Ctrl+S save, copy, download, word-wrap all intact
//   - No em dashes anywhere

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { portfolioApi } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ArrowLeft, Save, Loader2, CheckCircle, Eye, Cpu,
  Copy, WrapText, Sun, Moon, BrainCircuit, Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LINK_INTERCEPT_SCRIPT = `
<script>
(function() {
  function ensureHttps(href) {
    if (
      href.startsWith('http://') || href.startsWith('https://') ||
      href.startsWith('mailto:') || href.startsWith('tel:')
    ) return href;
    // Bare URL e.g. github.com/user or linkedin.com/in/user - prepend https://
    if (href.indexOf('.') > 0 && !href.startsWith('/') && !href.startsWith('#')) {
      return 'https://' + href;
    }
    return href;
  }
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#') return;
    if (href.startsWith('#')) {
      e.preventDefault();
      e.stopPropagation();
      var target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    // All external links open in a new tab - bare URLs get https:// prepended
    e.preventDefault();
    e.stopPropagation();
    window.open(ensureHttps(href), '_blank', 'noopener,noreferrer');
  }, true);
})();
</script>
`;

// ─── Theme-aware editor styles ────────────────────────────────────────────────
// Dark:  GitHub Dark inspired (classic for devs)
// Light: Warm cream with deep slate text (premium, readable)
const EDITOR_THEMES = {
  dark: {
    editorBg:    "#0d1117",
    editorText:  "#e6edf3",
    editorCaret: "#58a6ff",
    headerBg:    "#161b22",
    headerBorder:"#30363d",
    labelColor:  "#8b949e",
    metaColor:   "#6e7681",
    kbdBg:       "#21262d",
    kbdBorder:   "#30363d",
    kbdColor:    "#8b949e",
  },
  light: {
    editorBg:    "#faf8f5",
    editorText:  "#1e293b",
    editorCaret: "#4f46e5",
    headerBg:    "#f1ede6",
    headerBorder:"#ddd8cc",
    labelColor:  "#64748b",
    metaColor:   "#94a3b8",
    kbdBg:       "#e8e4dc",
    kbdBorder:   "#d0cbbf",
    kbdColor:    "#64748b",
  },
};

// Minimum panel width as percentage
const MIN_PCT = 20;
const MAX_PCT = 80;

const EditorPage = () => {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const { theme, toggleTheme } = useTheme();

  const [html, setHtml]             = useState("");
  const [originalHtml, setOriginalHtml] = useState("");
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [wordWrap, setWordWrap]     = useState(false);
  const [copied, setCopied]         = useState(false);

  // Resizable panel state
  const [editorPct, setEditorPct]   = useState(50);
  const isDragging                  = useRef(false);
  const containerRef                = useRef<HTMLDivElement>(null);
  const dragStartX                  = useRef(0);
  const dragStartPct                = useRef(50);

  const et = EDITOR_THEMES[theme as "dark" | "light"] ?? EDITOR_THEMES.dark;

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
      toast({ title: "Save failed", description: "Could not save changes.", variant: "destructive" });
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

  // ─── Drag-to-resize logic ─────────────────────────────────────────────────
  const onDividerPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current    = true;
    dragStartX.current    = e.clientX;
    dragStartPct.current  = editorPct;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [editorPct]);

  const onDividerPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    if (containerWidth === 0) return;
    const deltaX     = e.clientX - dragStartX.current;
    const deltaPct   = (deltaX / containerWidth) * 100;
    const newPct     = Math.min(MAX_PCT, Math.max(MIN_PCT, dragStartPct.current + deltaPct));
    setEditorPct(newPct);
  }, []);

  const onDividerPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

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

  const previewHtml = html
    ? html.replace(/<head([^>]*)>/, `<head$1>${LINK_INTERCEPT_SCRIPT}`)
    : "";

  const hasUnsavedChanges = html !== originalHtml;
  const displayName = templateName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");

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
      <header
        className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card sticky top-0 z-40"
        style={{ boxShadow: "0 1px 0 0 var(--border), 0 2px 8px rgba(0,0,0,0.04)" }}
      >
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
                Editor{" "}
                {hasUnsavedChanges && (
                  <span className="text-amber-500 font-semibold">Unsaved</span>
                )}
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
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

      {/* Split editor layout */}
      <div
        ref={containerRef}
        className="flex flex-1 overflow-hidden select-none"
        style={{ height: "calc(100vh - 56px)" }}
      >
        {/* Code editor pane */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: `${editorPct}%`, minWidth: 0 }}
        >
          {/* Editor header bar */}
          <div
            className="flex items-center justify-between px-4 py-2 border-b shrink-0"
            style={{
              background:   et.headerBg,
              borderColor:  et.headerBorder,
            }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: et.labelColor }}
              >
                HTML Source
              </span>
              <span
                className="text-[10px] font-mono"
                style={{ color: et.metaColor }}
              >
                {html.length.toLocaleString()} chars
              </span>
            </div>
            <div
              className="flex items-center gap-1 text-[10px]"
              style={{ color: et.metaColor }}
            >
              <kbd
                className="px-1.5 py-0.5 rounded font-mono text-[10px]"
                style={{
                  background: et.kbdBg,
                  border:     `1px solid ${et.kbdBorder}`,
                  color:      et.kbdColor,
                }}
              >
                {isMac ? "Cmd" : "Ctrl"}+S
              </kbd>
              <span>to save</span>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="flex-1 p-4 font-mono text-xs leading-relaxed resize-none outline-none overflow-auto"
            style={{
              background:  et.editorBg,
              color:       et.editorText,
              caretColor:  et.editorCaret,
              whiteSpace:  wordWrap ? "pre-wrap" : "pre",
              overflowWrap:wordWrap ? "break-word" : "normal",
              tabSize:     2,
            }}
            spellCheck={false}
            placeholder="Portfolio HTML will appear here..."
          />
        </div>

        {/* Draggable divider */}
        <div
          className="relative shrink-0 flex items-center justify-center cursor-col-resize z-10 group"
          style={{ width: "5px", background: "var(--border)" }}
          onPointerDown={onDividerPointerDown}
          onPointerMove={onDividerPointerMove}
          onPointerUp={onDividerPointerUp}
        >
          {/* Wider invisible hit area */}
          <div className="absolute inset-y-0 -left-2 -right-2" />
          {/* Visual indicator */}
          <div
            className="absolute inset-y-0 w-[3px] rounded-full transition-all duration-150 group-hover:opacity-100 opacity-0"
            style={{ background: "linear-gradient(180deg, #6366f1, #8b5cf6)", left: "1px" }}
          />
          {/* Center grip dots */}
          <div className="flex flex-col gap-1.5 relative z-10 opacity-40 group-hover:opacity-100 transition-opacity">
            {[0,1,2].map(i => (
              <div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ background: theme === "dark" ? "#8b949e" : "#94a3b8" }}
              />
            ))}
          </div>
        </div>

        {/* Live preview pane */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ flex: 1, minWidth: 0 }}
        >
          {/* Preview header */}
          <div
            className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0"
            style={{ minHeight: "37px" }}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Live Preview
              </span>
            </div>
            {hasUnsavedChanges && (
              <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>

          {/* iFrame preview */}
          <iframe
            srcDoc={previewHtml}
            title="Live Preview"
            className="flex-1 border-0 w-full"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
