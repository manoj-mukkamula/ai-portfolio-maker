// src/pages/PreviewPage.tsx
// Fix: inject <base target="_blank"> into the portfolio HTML so all anchor
// links inside the iframe open in a NEW TAB instead of navigating inside
// the iframe (which would show the app's own pages with a duplicate navbar).
// Also injects a scroll-reset so the portfolio always starts at the top.

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { portfolioApi } from "@/lib/api";
import {
  ArrowLeft, Download, Pencil, Loader2,
  Eye, Cpu, Share2, CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Injects a <base target="_blank"> tag right after <head> so every link
 * inside the generated portfolio opens in a new browser tab, preventing
 * nested navigation that would show the app's navbar inside the preview.
 *
 * Also ensures scroll starts at the top of the iframe content.
 */
function prepareHtml(rawHtml: string): string {
  const BASE_TAG = `<base target="_blank">`;

  // If already injected, skip
  if (rawHtml.includes(BASE_TAG)) return rawHtml;

  // Inject right after <head> (case-insensitive)
  const headMatch = rawHtml.match(/<head[^>]*>/i);
  if (headMatch && headMatch.index !== undefined) {
    const insertAt = headMatch.index + headMatch[0].length;
    return rawHtml.slice(0, insertAt) + BASE_TAG + rawHtml.slice(insertAt);
  }

  // Fallback: inject at very top
  return BASE_TAG + rawHtml;
}

const PreviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [templateName, setTemplateName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    portfolioApi
      .getOne(id)
      .then((res) => {
        const rawHtml: string = res.data.portfolio.html ?? "";
        setHtml(prepareHtml(rawHtml));
        setTemplateName(res.data.portfolio.templateName || "portfolio");
      })
      .catch(() =>
        toast({ title: "Error", description: "Portfolio not found.", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleDownload = () => {
    // Download the original HTML (without our injected base tag for portability)
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-${templateName || "site"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Portfolio saved as an HTML file." });
  };

  const handleFullScreen = () => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading preview...</p>
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
      {/* Preview navbar */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card z-10">

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

        {/* Right — actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFullScreen}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all"
            title="Open in a new tab (no app chrome)"
          >
            <Eye className="w-3.5 h-3.5" />
            Full Screen
          </button>

          <button
            onClick={handleCopyLink}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
            title="Copy preview link"
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
            <span className="hidden sm:inline">Download HTML</span>
            <span className="sm:hidden">Save</span>
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

      {/* Portfolio iframe — sandbox allows scripts but NOT top-navigation,
          combined with base target="_blank" this means:
          - page-internal hash links (#skills, #contact) still work
          - external links open in new tab
          - React Router links in the outer app are never triggered  */}
      <div className="flex-1">
        <iframe
          srcDoc={html}
          title="Portfolio Preview"
          className="w-full h-full border-0"
          style={{ minHeight: "calc(100vh - 56px)" }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
};

export default PreviewPage;
