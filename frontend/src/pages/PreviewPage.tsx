// src/pages/PreviewPage.tsx
//
// FIXES:
//   1. CRITICAL — sandbox changed from "allow-same-origin" to
//      "allow-same-origin allow-scripts". The previous value blocked ALL
//      JavaScript inside the portfolio iframe. Every section (Skills,
//      Projects, Experience, Education) is populated by inline <script> tags
//      — without allow-scripts none of them render any data at all.
//   2. Navbar redesigned: replaced plain text buttons with a polished bar
//      that shows template name, live badge, Full Screen, Download, and Edit.

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { portfolioApi } from "@/lib/api";
import { ArrowLeft, Download, Pencil, Loader2, Eye, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PreviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
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

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-${templateName || "site"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Portfolio saved as HTML file." });
  };

  const handleFullScreen = () => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
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

      {/* ── Preview navbar ─────────────────────────────────────────────── */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card">

        {/* Left side */}
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
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">
                Preview Mode
              </p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>

        {/* Right side — actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFullScreen}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Full Screen
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download HTML</span>
            <span className="sm:hidden">Save</span>
          </button>

          <button
            onClick={() => navigate(`/editor/${id}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </header>

      {/* ── Portfolio iframe ───────────────────────────────────────────── */}
      {/*
        FIX: "allow-scripts" added to sandbox.
        All portfolio templates populate Skills, Projects, Experience, and
        Education via inline <script> blocks. Without allow-scripts those
        blocks are silently blocked by the browser and every section renders
        empty even though the data is present in the HTML source.
        "allow-same-origin" is kept so relative resources resolve correctly.
      */}
      <div className="flex-1">
        <iframe
          srcDoc={html}
          title="Portfolio Preview"
          className="w-full h-full border-0"
          style={{ minHeight: "calc(100vh - 56px)" }}
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
};

export default PreviewPage;