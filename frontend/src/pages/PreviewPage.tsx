// src/pages/PreviewPage.tsx
// Fixed:
//  - Nav anchor links (#section) now scroll within the iframe (not open new tab)
//  - External links (http/https) open in new tab correctly
//  - Inject a script into the iframe that intercepts clicks:
//      * Internal anchor (#...) -> scrolls within iframe
//      * External URL -> opens in _blank
//  - skeleton loading continues until portfolio is ready, then fades in
//  - Download button added to navbar

import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { portfolioApi } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ArrowLeft, Download, Pencil, Eye, Cpu, Share2,
  CheckCircle, Sun, Moon, BrainCircuit,
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
      <div className="space-y-3">
        <div className="w-36 h-5 rounded bg-secondary" />
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-48 h-4 rounded bg-secondary" />
              <div className="w-32 h-3 rounded bg-secondary" />
              <div className="w-full h-3 rounded bg-secondary" />
            </div>
          </div>
        ))}
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

// ─── Link-intercept script injected into the iframe ──────────────────────────
// This script makes nav anchor links scroll within the iframe,
// while any full URL (http/https) opens in a real new browser tab.
const LINK_INTERCEPT_SCRIPT = `
<script>
(function() {
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;

    // Internal anchor link — scroll within the page
    if (href.startsWith('#')) {
      e.preventDefault();
      e.stopPropagation();
      var target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    // External URL — open in a real new tab via window.open
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

// ─── Main component ───────────────────────────────────────────────────────────
const PreviewPage = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [html, setHtml]                         = useState("");
  const [loading, setLoading]                   = useState(true);
  const [showSkeleton, setShowSkeleton]         = useState(params.get("loading") === "1");
  const [contentVisible, setContentVisible]     = useState(false);
  const [templateName, setTemplateName]         = useState("");
  const [copied, setCopied]                     = useState(false);

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
      .finally(() => {
        setLoading(false);

        if (params.get("loading") === "1") {
          // Show skeleton until portfolio data is ready, then a short fade-in
          setTimeout(() => {
            setShowSkeleton(false);
            setTimeout(() => setContentVisible(true), 120);
          }, 1800);
        } else {
          setContentVisible(true);
        }
      });
  }, [id, toast, params]);

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

  const handleFullScreen = () => {
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
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

  // Inject the link-intercept script right after <head> open tag
  // This gives us proper behavior for both anchor links and external URLs
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
      <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card sticky top-0 z-40">
        {/* Left */}
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
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">Preview Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg hover:bg-secondary transition-colors border border-transparent hover:border-border"
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>

          <button
            onClick={handleFullScreen}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all"
            title="Open in a new tab (no iframe restrictions)"
          >
            <Eye className="w-3.5 h-3.5" />
            Full Screen
          </button>

          <button
            onClick={handleCopyLink}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            {copied
              ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Copied</>
              : <><Share2 className="w-3.5 h-3.5" /> Share</>}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={() => navigate(`/editor/${id}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </header>

      {/* Content area */}
      <div className="flex-1 relative" style={{ minHeight: "calc(100vh - 56px)" }}>
        {/* Skeleton overlay — shown while loading=1 */}
        {showSkeleton && (
          <div className="absolute inset-0 z-10">
            <PortfolioSkeleton />
          </div>
        )}

        {/* Portfolio iframe */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? "scale(1)" : "scale(0.99)",
          }}
        >
          <iframe
            srcDoc={safeHtml}
            title="Portfolio Preview"
            className="w-full border-0"
            style={{ height: "calc(100vh - 56px)" }}
            // allow-popups: lets window.open() calls (from our injected script) work
            // allow-scripts: portfolio animations + our intercept script
            // allow-same-origin: fonts and assets load correctly
            // allow-forms: contact forms work
            // No allow-top-navigation: prevents iframe from redirecting the whole app
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
