// src/pages/PreviewPage.tsx
// Two entry modes:
//   A) Normal:  /preview/:id         — load portfolio by ID, show immediately
//   B) Pending: /preview/pending?loading=1 — skeleton shown while generateStore
//               promise resolves → then redirect to /preview/:id permanently
//
// External link fix: LINK_INTERCEPT_SCRIPT injected into every portfolio <head>
//   - #anchor links  → smooth scroll inside iframe
//   - external links → window.open in new tab (prevents LinkedIn/GitHub iframe block)
//   - window.open    → overridden so JS-triggered navigations also open in new tab

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { portfolioApi } from "@/lib/api";
import { generateStore } from "@/lib/generateStore";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ArrowLeft, Download, Pencil, Eye, Cpu, Share2,
  CheckCircle, Sun, Moon, BrainCircuit, Printer,
  Maximize2, Minimize2, Github, X, ExternalLink, FileDown, Layers,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SHIMMER = `
  @keyframes preview-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  .ps-shimmer {
    background: linear-gradient(90deg,
      var(--ps-base, rgba(148,163,184,0.10)) 0%,
      var(--ps-hi,   rgba(148,163,184,0.20)) 50%,
      var(--ps-base, rgba(148,163,184,0.10)) 100%
    );
    background-size: 800px 100%;
    animation: preview-shimmer 1.6s ease-in-out infinite;
    border-radius: 0.5rem;
  }
  .dark .ps-shimmer { --ps-base: rgba(255,255,255,0.05); --ps-hi: rgba(255,255,255,0.10); }
`;

const Sk = ({ w = "100%", h = "1rem", r = "0.5rem", d = 0 }: { w?: string; h?: string; r?: string; d?: number }) => (
  <div className="ps-shimmer" style={{ width: w, height: h, borderRadius: r, animationDelay: `${d}ms` }} />
);

const PortfolioSkeleton = () => (
  <>
    <style>{SHIMMER}</style>
    <div className="w-full bg-background" style={{ minHeight: "calc(100vh - 56px)" }}>
      {/* Hero */}
      <div className="flex flex-col items-center justify-center gap-5 py-24 px-8"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)" }}>
        <Sk w="96px"  h="96px"  r="50%" />
        <Sk w="260px" h="28px" />
        <Sk w="380px" h="16px" d={60} />
        <div className="flex gap-3 mt-2">
          <Sk w="88px" h="34px" r="8px" d={80} />
          <Sk w="88px" h="34px" r="8px" d={140} />
          <Sk w="88px" h="34px" r="8px" d={200} />
        </div>
      </div>
      {/* Sections */}
      <div className="max-w-4xl mx-auto w-full px-6 py-12 space-y-12">
        <div className="space-y-3">
          <Sk w="140px" h="20px" />
          <Sk h="13px" d={40} /><Sk w="92%" h="13px" d={80} /><Sk w="76%" h="13px" d={120} />
        </div>
        <div className="space-y-4">
          <Sk w="100px" h="20px" />
          <div className="flex flex-wrap gap-2">
            {[80,72,96,60,84,68,76,88].map((w,i) => <Sk key={i} w={`${w}px`} h="30px" r="15px" d={i*30} />)}
          </div>
        </div>
        <div className="space-y-4">
          <Sk w="120px" h="20px" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl border border-border p-5 space-y-3">
                <Sk w="65%" h="16px" d={i*50} />
                <Sk h="11px" d={i*50+40} /><Sk w="85%" h="11px" d={i*50+80} />
                <div className="flex gap-2 pt-1"><Sk w="56px" h="22px" r="4px" /><Sk w="48px" h="22px" r="4px" /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Sk w="160px" h="20px" />
          {[1,2].map(i => (
            <div key={i} className="border-l-2 border-border pl-5 space-y-2">
              <Sk w="50%" h="16px" d={i*60} /><Sk w="35%" h="12px" d={i*60+30} /><Sk w="90%" h="11px" d={i*60+60} />
            </div>
          ))}
        </div>
      </div>
      {/* Pill */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
          style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", border: "1px solid rgba(99,102,241,0.4)" }}>
          <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          <span className="text-white text-sm font-medium">Building your portfolio...</span>
        </div>
      </div>
    </div>
  </>
);

// ─── External link intercept ──────────────────────────────────────────────────
// Injected into every portfolio's <head>.
// #anchor → scroll inside iframe | everything else → new tab (no iframe block)
const LINK_INTERCEPT_SCRIPT = `
<script>
(function() {
  function isExternal(href) {
    if (!href || href === '#' || href.startsWith('#')) return false;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    return true;
  }
  function normalise(href) {
    if (href.startsWith('http://') || href.startsWith('https://')) return href;
    if (href.indexOf('.') > 0 && !href.startsWith('/')) return 'https://' + href.replace(/^\\/+/, '');
    return href;
  }
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = (a.getAttribute('href') || '').trim();
    if (!href || href === '#') return;
    if (href.startsWith('#')) {
      e.preventDefault(); e.stopPropagation();
      var el = document.getElementById(href.slice(1)) || document.querySelector('[name="'+href.slice(1)+'"]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (isExternal(href)) {
      e.preventDefault(); e.stopPropagation();
      window.open(normalise(href), '_blank', 'noopener,noreferrer');
    }
  }, true);
  var _open = window.open;
  window.open = function(url, target, features) {
    if (url && typeof url === 'string' && isExternal(url))
      return _open.call(window, normalise(url), '_blank', 'noopener,noreferrer');
    return _open.apply(window, arguments);
  };
})();
</script>
`;

// ─── Modals ───────────────────────────────────────────────────────────────────
const GithubPagesModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-card border border-border rounded-2xl shadow-modal w-full max-w-lg p-7 animate-fade-in">
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
        Your portfolio downloads as a single{" "}
        <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono text-primary">.html</code>{" "}
        file. Publishing it as a live URL takes just a few steps.
      </p>
      <ol className="space-y-3">
        {[
          { n: "01", t: "Download your portfolio using the Download button in the top bar." },
          { n: "02", t: 'Create a new GitHub repository named yourname.github.io (replace "yourname" with your actual GitHub username).' },
          { n: "03", t: "Upload the downloaded .html file and rename it to index.html." },
          { n: "04", t: "Go to Settings, then Pages, and set the source branch to main." },
          { n: "05", t: "Your portfolio goes live at https://yourname.github.io within a minute or two." },
        ].map(({ n, t }) => (
          <li key={n} className="flex gap-3 text-sm text-muted-foreground">
            <span className="text-xs font-bold text-primary font-mono mt-0.5 shrink-0">{n}</span>
            <span className="leading-relaxed">{t}</span>
          </li>
        ))}
      </ol>
      <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-5 text-primary text-sm font-medium hover:underline">
        Official GitHub Pages guide <ExternalLink className="w-3.5 h-3.5" />
      </a>
      <button onClick={onClose}
        className="mt-5 w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
        Got it
      </button>
    </div>
  </div>
);

const PdfModal = ({ onClose, onPrint }: { onClose: () => void; onPrint: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-card border border-border rounded-2xl shadow-modal w-full max-w-md p-7 animate-fade-in">
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
        Your portfolio opens in a new tab with the print dialog ready. In that dialog:
      </p>
      <ol className="space-y-2.5">
        {[
          'Set "Destination" to "Save as PDF".',
          'Set "Layout" to Landscape for the best fit.',
          'Turn off "Headers and footers" for a clean look.',
          "Click Save and choose your file location.",
        ].map((step, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="flex gap-3 mt-6">
        <button onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
          Cancel
        </button>
        <button onClick={() => { onPrint(); onClose(); }}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
          <Printer className="w-4 h-4" /> Open Print Dialog
        </button>
      </div>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const PreviewPage = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const isPending = id === "pending";

  const [html, setHtml]                       = useState("");
  const [resolvedId, setResolvedId]           = useState<string | null>(isPending ? null : (id ?? null));
  const [showSkeleton, setShowSkeleton]       = useState(isPending || params.get("loading") === "1");
  const [contentVisible, setContentVisible]   = useState(false);
  const [templateName, setTemplateName]       = useState("");
  const [copied, setCopied]                   = useState(false);
  const [isFullscreen, setIsFullscreen]       = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [showPdfModal, setShowPdfModal]       = useState(false);
  const [fatalError, setFatalError]           = useState("");

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const load = async (portfolioId: string) => {
      try {
        const res = await portfolioApi.getOne(portfolioId);
        setHtml(res.data.portfolio.html);
        setTemplateName(res.data.portfolio.templateName || "portfolio");
        setResolvedId(portfolioId);
        // Update URL to permanent path without triggering a navigation loop
        window.history.replaceState(null, "", `/preview/${portfolioId}`);
      } catch {
        setFatalError("Portfolio not found or failed to load.");
        toast({ title: "Error", description: "Could not load this portfolio.", variant: "destructive" });
      } finally {
        setShowSkeleton(false);
        setTimeout(() => setContentVisible(true), 80);
      }
    };

    if (isPending) {
      // Consume the generate promise stored by GeneratePage
      const promise = generateStore.take();
      if (!promise) {
        // Edge case: user refreshed /preview/pending — redirect home
        navigate("/generate", { replace: true });
        return;
      }
      promise
        .then(({ portfolioId }) => load(portfolioId))
        .catch((err: any) => {
          const msg: string = err?.response?.data?.message || err?.message || "Generation failed.";
          setFatalError(msg);
          setShowSkeleton(false);
          toast({ title: "Generation failed", description: msg, variant: "destructive" });
        });
    } else if (id) {
      load(id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleFsChange = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

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
    toast({ title: "Downloaded", description: "Your portfolio HTML file is ready." });
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.addEventListener("load", () => { w.focus(); w.print(); }); }
  };

  const handleToggleFullscreen = async () => {
    if (!isFullscreen) {
      try { await document.documentElement.requestFullscreen(); setIsFullscreen(true); }
      catch { const w = window.open("", "_blank"); if (w) { w.document.write(html); w.document.close(); } }
    } else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied", description: "Preview URL copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Could not copy the link.", variant: "destructive" });
    }
  };

  const displayName = templateName
    .split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const safeHtml = html
    ? html.replace(/<head([^>]*)>/, `<head$1>${LINK_INTERCEPT_SCRIPT}`)
    : "";

  // Fatal error state
  if (fatalError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm px-6">
          <p className="text-lg font-bold text-foreground mb-2">Something went wrong</p>
          <p className="text-sm text-muted-foreground mb-5">{fatalError}</p>
          <button
            onClick={() => navigate("/generate")}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card sticky top-0 z-40"
        style={{ boxShadow: "0 1px 0 0 var(--border), 0 2px 8px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <BrainCircuit className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-primary" />
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
          {/* Hint: external links (LinkedIn, GitHub etc.) open in a new tab via JS intercept */}
          {html && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border ml-1">
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Links open in new tab</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg hover:bg-secondary transition-colors">
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button onClick={() => setShowPdfModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
            <FileDown className="w-3.5 h-3.5" /><span className="hidden md:inline ml-0.5">PDF</span>
          </button>
          <button onClick={handleToggleFullscreen}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
            {isFullscreen
              ? <><Minimize2 className="w-3.5 h-3.5" /><span className="hidden md:inline ml-0.5">Exit</span></>
              : <><Eye className="w-3.5 h-3.5" /><span className="hidden md:inline ml-0.5">Full</span></>}
          </button>
          <button onClick={() => setShowGithubModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
            <Github className="w-3.5 h-3.5" /><span className="hidden md:inline ml-0.5">Host</span>
          </button>
          <button onClick={handleCopyLink}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">
            {copied
              ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="ml-1">Copied</span></>
              : <><Share2 className="w-3.5 h-3.5" /><span className="ml-1">Share</span></>}
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
            disabled={!html}>
            <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline ml-0.5">Download</span>
          </button>
          <button
            onClick={() => resolvedId && navigate(`/editor/${resolvedId}`)}
            disabled={!resolvedId}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-px active:scale-[0.98] ml-1 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <Pencil className="w-3.5 h-3.5" /><span>Edit</span>
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
          {safeHtml && (
            <iframe
              srcDoc={safeHtml}
              title="Portfolio Preview"
              className="w-full border-0"
              style={{ height: "calc(100vh - 56px)" }}
              // allow-popups: required for window.open() inside iframe (link intercept)
              // allow-scripts: required for LINK_INTERCEPT_SCRIPT to run
              // NO allow-top-navigation: prevents iframe from redirecting parent
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          )}
        </div>
      </div>

      {showGithubModal && <GithubPagesModal onClose={() => setShowGithubModal(false)} />}
      {showPdfModal    && <PdfModal onClose={() => setShowPdfModal(false)} onPrint={handlePrint} />}
    </div>
  );
};

export default PreviewPage;
