// src/pages/PreviewPage.tsx
// Premium redesign:
//  - PDF save via print-to-PDF modal with clear instructions
//  - Fullscreen toggle with indicator badge
//  - GitHub Pages hosting modal
//  - Anchor nav links scroll within iframe (not reload the page)
//  - External links open in new tab
//  - Skeleton loading with fade-in

import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { portfolioApi } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ArrowLeft, Download, Pencil, Eye, Cpu, Share2,
  CheckCircle, Sun, Moon, BrainCircuit, Printer,
  Maximize2, Minimize2, Github, X, ExternalLink, FileDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const PortfolioSkeleton = () => (
  <div className="w-full h-full bg-background animate-pulse flex flex-col" style={{ minHeight: "calc(100vh - 56px)" }}>
    <div
      className="flex flex-col items-center justify-center gap-5 py-24 px-8"
      style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)" }}
    >
      <div className="w-24 h-24 rounded-full bg-white/10" />
      <div className="w-48 h-6 rounded-lg bg-white/15" />
      <div className="w-72 h-4 rounded-lg bg-white/10" />
      <div className="flex gap-3 mt-2">
        <div className="w-20 h-8 rounded-lg bg-white/10" />
        <div className="w-20 h-8 rounded-lg bg-white/10" />
        <div className="w-20 h-8 rounded-lg bg-white/10" />
      </div>
    </div>
    <div className="max-w-4xl mx-auto w-full px-6 py-12 space-y-10">
      <div className="space-y-3">
        <div className="w-32 h-5 rounded bg-secondary" />
        <div className="w-full h-3 rounded bg-secondary" />
        <div className="w-5/6 h-3 rounded bg-secondary" />
        <div className="w-4/6 h-3 rounded bg-secondary" />
      </div>
      <div className="space-y-3">
        <div className="w-24 h-5 rounded bg-secondary" />
        <div className="flex flex-wrap gap-2">
          {[80, 72, 64, 88, 60, 76, 68].map((w, i) => (
            <div key={i} className="h-7 rounded-full bg-secondary" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="w-28 h-5 rounded bg-secondary" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-secondary h-36 border border-border" />
          ))}
        </div>
      </div>
    </div>
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-modal"
        style={{
          background: "linear-gradient(135deg, #1e1b4b, #312e81)",
          border: "1px solid rgba(99,102,241,0.4)",
        }}
      >
        <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        <span className="text-white text-sm font-medium">Rendering your portfolio...</span>
      </div>
    </div>
  </div>
);

// ─── Link-intercept script ────────────────────────────────────────────────────
const LINK_INTERCEPT_SCRIPT = `
<script>
(function() {
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#')) {
      e.preventDefault();
      e.stopPropagation();
      var target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      e.preventDefault();
      e.stopPropagation();
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
  }, true);
})();
</script>
`;

// ─── Modals ───────────────────────────────────────────────────────────────────
const GithubPagesModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-card border border-border rounded-2xl shadow-modal w-full max-w-lg mx-4 p-7 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Github className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Host on GitHub Pages</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Free public URL for your portfolio</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <p className="text-sm text-foreground font-medium mb-4">
        Your portfolio downloads as a single <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono text-primary">.html</code> file. Publishing it as a live URL takes just a few steps.
      </p>
      <ol className="space-y-3">
        {[
          { n: "01", t: "Download your portfolio using the button in the top bar." },
          { n: "02", t: 'Create a new GitHub repository named yourname.github.io, replacing "yourname" with your GitHub username.' },
          { n: "03", t: "Upload the downloaded .html file and rename it to index.html." },
          { n: "04", t: "Go to Settings, then Pages, and set the source to the main branch." },
          { n: "05", t: "Your portfolio goes live at https://yourname.github.io within a minute or two." },
        ].map(({ n, t }) => (
          <li key={n} className="flex gap-3 text-sm text-muted-foreground">
            <span className="text-xs font-bold text-primary font-mono mt-0.5 shrink-0">{n}</span>
            <span className="leading-relaxed">{t}</span>
          </li>
        ))}
      </ol>
      <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 text-primary text-sm font-medium hover:underline">
        Official GitHub Pages guide <ExternalLink className="w-3.5 h-3.5" />
      </a>
      <button onClick={onClose} className="mt-5 w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
        Got it
      </button>
    </div>
  </div>
);

const PdfModal = ({ onClose, onPrint }: { onClose: () => void; onPrint: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-card border border-border rounded-2xl shadow-modal w-full max-w-md mx-4 p-7 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FileDown className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Save as PDF</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Get a print-perfect PDF in seconds</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        Your portfolio opens in a new tab with the print dialog ready. In the dialog:
      </p>
      <ol className="space-y-2.5">
        {[
          'Set "Destination" to "Save as PDF".',
          'Set "Layout" to Landscape for best fit.',
          'Disable "Headers and footers" for a clean look.',
          "Click Save and choose your file location.",
        ].map((step, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">Cancel</button>
        <button
          onClick={() => { onPrint(); onClose(); }}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
        >
          <Printer className="w-4 h-4" /> Open Print Dialog
        </button>
      </div>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const PreviewPage = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [html, setHtml]                       = useState("");
  const [loading, setLoading]                 = useState(true);
  const [showSkeleton, setShowSkeleton]       = useState(params.get("loading") === "1");
  const [contentVisible, setContentVisible]   = useState(false);
  const [templateName, setTemplateName]       = useState("");
  const [copied, setCopied]                   = useState(false);
  const [isFullscreen, setIsFullscreen]       = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [showPdfModal, setShowPdfModal]       = useState(false);

  useEffect(() => {
    if (!id) return;
    portfolioApi
      .getOne(id)
      .then((res) => {
        setHtml(res.data.portfolio.html);
        setTemplateName(res.data.portfolio.templateName || "portfolio");
      })
      .catch(() => toast({ title: "Error", description: "Portfolio not found.", variant: "destructive" }))
      .finally(() => {
        setLoading(false);
        if (params.get("loading") === "1") {
          setTimeout(() => {
            setShowSkeleton(false);
            setTimeout(() => setContentVisible(true), 120);
          }, 1800);
        } else {
          setContentVisible(true);
        }
      });
  }, [id, toast, params]);

  useEffect(() => {
    const handleFsChange = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `portfolio-${templateName || "site"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Your portfolio HTML file is ready." });
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.addEventListener("load", () => { w.focus(); w.print(); });
    }
  };

  const handleToggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        const w = window.open("", "_blank");
        if (w) { w.document.write(html); w.document.close(); }
      }
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied", description: "Preview URL copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Could not copy the link.", variant: "destructive" });
    }
  };

  const displayName = templateName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const safeHtml = html
    ? html.replace(/<head([^>]*)>/, `<head$1>${LINK_INTERCEPT_SCRIPT}`)
    : "";

  if (loading && !showSkeleton) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card sticky top-0 z-40 shadow-sm">
        {/* Left */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <BrainCircuit className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-bold text-foreground">{displayName || "Portfolio"}</p>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Live</span>
          </div>
          {isFullscreen && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Maximize2 className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider hidden sm:inline">Fullscreen</span>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>

          <button
            onClick={() => setShowPdfModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title="Save as PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden md:inline ml-1">PDF</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            {isFullscreen
              ? <><Minimize2 className="w-3.5 h-3.5" /><span className="hidden md:inline ml-1">Exit</span></>
              : <><Eye className="w-3.5 h-3.5" /><span className="hidden md:inline ml-1">Full Screen</span></>}
          </button>

          <button
            onClick={() => setShowGithubModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title="Host on GitHub Pages for free"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden md:inline ml-1">Host Free</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            {copied
              ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="ml-1">Copied</span></>
              : <><Share2 className="w-3.5 h-3.5" /><span className="ml-1">Share</span></>}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
            title="Download as HTML"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline ml-1">Download</span>
          </button>

          <button
            onClick={() => navigate(`/editor/${id}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] ml-1"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 relative" style={{ minHeight: "calc(100vh - 56px)" }}>
        {showSkeleton && (
          <div className="absolute inset-0 z-10">
            <PortfolioSkeleton />
          </div>
        )}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{ opacity: contentVisible ? 1 : 0, transform: contentVisible ? "scale(1)" : "scale(0.99)" }}
        >
          <iframe
            srcDoc={safeHtml}
            title="Portfolio Preview"
            className="w-full border-0"
            style={{ height: "calc(100vh - 56px)" }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>

      {showGithubModal && <GithubPagesModal onClose={() => setShowGithubModal(false)} />}
      {showPdfModal && <PdfModal onClose={() => setShowPdfModal(false)} onPrint={handlePrint} />}
    </div>
  );
};

export default PreviewPage;
