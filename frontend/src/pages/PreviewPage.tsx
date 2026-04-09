// src/pages/PreviewPage.tsx
// Full-screen preview of a generated portfolio.
// Download button saves the HTML file locally.
// Edit button opens the HTML editor.

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { portfolioApi } from "@/lib/api";
import { ArrowLeft, Download, Pencil, Loader2 } from "lucide-react";
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

  // Download the portfolio as a standalone HTML file
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="hidden sm:block">
            <p className="font-display font-bold text-foreground capitalize">
              {templateName.replace(/-/g, " ")}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Preview Mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download HTML file */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download HTML
          </button>

          {/* Open in editor */}
          <button
            onClick={() => navigate(`/editor/${id}`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
      </header>

      {/* Full-screen portfolio iframe */}
      <div className="flex-1">
        <iframe
          srcDoc={html}
          title="Portfolio Preview"
          className="w-full h-full border-0"
          style={{ minHeight: "calc(100vh - 57px)" }}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
};

export default PreviewPage;