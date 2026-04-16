// src/pages/GeneratePage.tsx
// Changes:
//  - Generate button is always visible (styled disabled state with border, not invisible)
//  - Hover effects on generate button: size increase via padding, glowing border
//  - On generate: preloader shows ~10s, then immediately redirects to /preview/:id?loading=1
//  - No "waiting on generate page" — navigation happens as soon as preloader completes

import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import GeneratePreloader from "@/components/GeneratePreloader";
import { portfolioApi } from "@/lib/api";
import { TEMPLATES } from "@/lib/templates";
import {
  Upload, FileText, Sparkles, Info,
  CheckCircle, Cpu, ChevronDown, X, AlertTriangle, Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ErrorKind = "quota_daily" | "quota_credits" | "general";

const categorizeError = (msg: string): ErrorKind => {
  const lower = msg.toLowerCase();
  if (lower.includes("daily") || lower.includes("midnight") || lower.includes("12:30") || lower.includes("quota reached")) {
    return "quota_daily";
  }
  if (lower.includes("credit") || lower.includes("0 credit")) {
    return "quota_credits";
  }
  return "general";
};

const GeneratePage = () => {
  const { refreshUser, user } = useAuth();
  const navigate              = useNavigate();
  const { toast }             = useToast();

  const [tab, setTab]                           = useState<"upload" | "paste">("upload");
  const [file, setFile]                         = useState<File | null>(null);
  const [resumeText, setResumeText]             = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreloader, setShowPreloader]       = useState(false);
  const [dragOver, setDragOver]                 = useState(false);
  const [tipOpen, setTipOpen]                   = useState(true);
  const [apiError, setApiError]                 = useState<{ kind: ErrorKind; msg: string } | null>(null);
  const [pendingPortfolioId, setPendingPortfolioId] = useState<string | null>(null);

  const apiPromiseRef   = useRef<Promise<any> | null>(null);
  const isSubmittingRef = useRef(false);
  const selectedTpl     = TEMPLATES.find((t) => t.id === selectedTemplate);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && (f.type === "application/pdf" || f.name.endsWith(".docx"))) {
        setFile(f);
      } else {
        toast({
          title:       "Invalid file type",
          description: "Only PDF and DOCX files are accepted.",
          variant:     "destructive",
        });
      }
    },
    [toast]
  );

  const handleGenerate = () => {
    if (isSubmittingRef.current) return;
    setApiError(null);

    if (!selectedTemplate) {
      toast({ title: "No template selected", description: "Pick a template before generating.", variant: "destructive" });
      return;
    }
    if (tab === "upload" && !file) {
      toast({ title: "No resume uploaded", description: "Upload a PDF or DOCX file to continue.", variant: "destructive" });
      return;
    }
    if (tab === "paste" && !resumeText.trim()) {
      toast({ title: "Resume text is empty", description: "Paste your resume content above.", variant: "destructive" });
      return;
    }
    if ((user?.credits ?? 0) <= 0) {
      toast({ title: "No credits left", description: "Your credits reset every 24 hours.", variant: "destructive" });
      return;
    }

    isSubmittingRef.current = true;

    // Start the API call immediately
    let apiCall: Promise<any>;
    if (tab === "upload" && file) {
      const fd = new FormData();
      fd.append("resume", file);
      fd.append("template", selectedTpl!.template);
      fd.append("templateName", selectedTpl!.id);
      apiCall = portfolioApi.generate(fd);
    } else {
      apiCall = portfolioApi.generate({
        resumeText,
        template:     selectedTpl!.template,
        templateName: selectedTpl!.id,
      });
    }
    apiPromiseRef.current = apiCall;

    // Pre-resolve the portfolio ID as soon as API returns (may happen during or after preloader)
    apiCall.then(async (res) => {
      const pid = res?.data?.portfolio?.id || res?.data?.portfolio?._id;
      if (pid) {
        setPendingPortfolioId(pid);
        await refreshUser();
      }
    }).catch(() => {
      // error is handled in handlePreloaderComplete
    });

    setShowPreloader(true);
  };

  // Called after the ~10s preloader animation completes
  const handlePreloaderComplete = async () => {
    setShowPreloader(false);

    // If we already have the portfolio ID (fast API), go now
    if (pendingPortfolioId) {
      isSubmittingRef.current = false;
      navigate(`/preview/${pendingPortfolioId}?loading=1`);
      return;
    }

    // Otherwise wait for API to finish
    try {
      const res = await apiPromiseRef.current;
      await refreshUser();
      const pid = res?.data?.portfolio?.id || res?.data?.portfolio?._id;
      if (!pid) throw new Error("No portfolio ID returned");
      isSubmittingRef.current = false;
      navigate(`/preview/${pid}?loading=1`);
    } catch (err: any) {
      isSubmittingRef.current = false;
      const msg: string =
        err?.response?.data?.message || err?.message || "Something went wrong. Please try again.";

      const kind = categorizeError(msg);
      if (kind !== "general") {
        setApiError({ kind, msg });
      } else {
        toast({ title: "Generation failed", description: msg, variant: "destructive" });
      }
    }
  };

  const hasInput    = tab === "upload" ? !!file : resumeText.trim().length > 0;
  const canGenerate = hasInput && !!selectedTemplate && (user?.credits ?? 0) > 0;
  const charCount   = resumeText.length;
  const charColor   =
    charCount === 0     ? "text-muted-foreground"
    : charCount < 100   ? "text-red-500"
    : charCount < 200   ? "text-amber-500"
    : "text-green-500";

  const PASTE_PLACEHOLDER = `Paste your resume text here...

Example format that works best:
Name: Arjun Sharma
Email: arjun.sharma@gmail.com
Phone: +91 98765 43210

Skills: React, Node.js, TypeScript, MongoDB, Docker
Education: B.Tech Computer Science, VIT Vellore, 2025

Experience:
  - SDE Intern at Razorpay (Jun 2024 – Dec 2024)
    Built payment webhook retry system using Node.js and Redis
    Reduced failed transactions by 18%

Projects:
  - DevConnect: Real-time developer networking app (React, Socket.io)
  - AutoResume: AI-powered resume builder using OpenAI API`;

  return (
    <AppLayout>
      {showPreloader && <GeneratePreloader onComplete={handlePreloaderComplete} />}

      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Page Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <p className="text-[11px] tracking-widest text-primary font-semibold uppercase">
              Gemini AI Engine
            </p>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-0.5">Portfolio Generator</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl">
            Upload your resume and let Google Gemini AI extract your details and build a
            professional portfolio website automatically.
          </p>
        </div>

        {/* Error banners */}
        {apiError && (
          <div className={`mb-5 rounded-xl p-4 flex gap-3 border ${
            apiError.kind === "quota_daily"
              ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
              : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
          }`}>
            {apiError.kind === "quota_daily" ? (
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-semibold text-sm mb-1 ${
                apiError.kind === "quota_daily"
                  ? "text-amber-800 dark:text-amber-300"
                  : "text-red-800 dark:text-red-300"
              }`}>
                {apiError.kind === "quota_daily" ? "Daily Quota Reached" : "Generation Failed"}
              </p>
              <p className={`text-xs leading-relaxed ${
                apiError.kind === "quota_daily"
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-red-700 dark:text-red-400"
              }`}>
                {apiError.kind === "quota_daily" ? (
                  <>
                    The free Gemini API quota resets at midnight Pacific Time (around 12:30 PM IST).
                    To generate right now, add a second key from a different Google account as{" "}
                    <code className="bg-amber-100 dark:bg-amber-800/50 px-1 rounded font-mono">
                      GEMINI_API_KEY_2
                    </code>{" "}
                    in{" "}
                    <code className="bg-amber-100 dark:bg-amber-800/50 px-1 rounded font-mono">
                      backend/.env
                    </code>{" "}
                    and restart the server.
                  </>
                ) : (
                  apiError.msg
                )}
              </p>
              {apiError.kind === "quota_daily" && (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-800 dark:text-amber-300 underline mt-2 font-medium"
                >
                  Get a free key at Google AI Studio
                </a>
              )}
            </div>
            <button
              onClick={() => setApiError(null)}
              className="ml-auto text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left panel */}
          <div className="lg:col-span-3 space-y-5">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {(["upload", "paste"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors capitalize ${
                    tab === t
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "upload" ? "Upload File" : "Paste Text"}
                </button>
              ))}
            </div>

            {tab === "upload" ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`rounded-xl p-8 text-center transition-all duration-200 ${
                  dragOver
                    ? "border-2 border-primary bg-primary/5"
                    : file
                    ? "border-2 border-green-500/40 bg-green-500/5"
                    : "border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/[0.02]"
                }`}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      onClick={() => setFile(null)}
                      className="flex items-center gap-1 text-xs text-destructive hover:underline mt-1"
                    >
                      <X className="w-3 h-3" /> Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-200 ${
                        dragOver ? "scale-110" : ""
                      }`}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))",
                        border: "1px solid rgba(99,102,241,0.2)",
                      }}
                    >
                      <Upload
                        className={`w-5 h-5 text-primary transition-transform duration-200 ${
                          dragOver ? "scale-110" : ""
                        }`}
                      />
                    </div>
                    <p className="font-semibold text-foreground text-sm">
                      Drag and drop your resume here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      PDF or DOCX format, max 5MB
                    </p>
                    <label className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-sm font-medium cursor-pointer hover:bg-secondary hover:border-primary/30 transition-all">
                      Select File
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setFile(e.target.files[0]);
                        }}
                      />
                    </label>
                  </>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder={PASTE_PLACEHOLDER}
                  rows={12}
                  className="w-full rounded-xl bg-secondary border border-border p-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all font-mono"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className={`text-xs ${charColor} font-medium transition-colors`}>
                    {charCount} characters
                    {charCount > 0 && charCount < 200 && " - add more for richer results"}
                    {charCount >= 200 && " - looks great!"}
                  </p>
                  <p className="text-xs text-muted-foreground">Best with 200+ characters</p>
                </div>
              </div>
            )}

            {/* Template grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-foreground">Select Template</h2>
                <span className="text-xs text-muted-foreground">
                  {TEMPLATES.length} templates available
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`text-left rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                      selectedTemplate === tpl.id
                        ? "border-primary shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                        : "border-border hover:border-primary/30"
                    }`}
                    style={
                      selectedTemplate === tpl.id
                        ? { background: "rgba(99,102,241,0.03)" }
                        : {}
                    }
                  >
                    <div className="h-24 rounded-t-lg overflow-hidden bg-secondary relative">
                      <iframe
                        srcDoc={tpl.template}
                        title={tpl.name}
                        className="w-full h-full border-0 pointer-events-none"
                        style={{
                          transform:       "scale(0.4)",
                          transformOrigin: "top left",
                          width:           "250%",
                          height:          "250%",
                        }}
                        sandbox="allow-same-origin"
                      />
                      {selectedTemplate === tpl.id && (
                        <div className="absolute top-2 right-2">
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                            <CheckCircle className="w-2.5 h-2.5" /> Selected
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{tpl.name}</p>
                        <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
                          {tpl.style}
                        </p>
                      </div>
                      {tpl.premium && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white uppercase shrink-0">
                          Premium
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-muted-foreground">Live Preview</span>
                </div>
                {selectedTpl && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {selectedTpl.name}
                  </span>
                )}
              </div>
              <div className="h-72 flex items-center justify-center bg-secondary overflow-hidden relative">
                {selectedTpl ? (
                  <iframe
                    srcDoc={selectedTpl.template}
                    title="Template Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="text-center px-6">
                    <div className="w-10 h-10 rounded-xl bg-border flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">Select a template to preview</p>
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-1">
                      Preview renders here
                    </p>
                  </div>
                )}
              </div>
              {file && (
                <div className="px-4 py-2 border-t border-border flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground truncate">
                    Ready: {file.name}
                  </span>
                </div>
              )}
            </div>

            {/* AI Tip */}
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <button
                onClick={() => setTipOpen(!tipOpen)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-sm text-foreground">AI Tip</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                    tipOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {tipOpen && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Include your name, email, skills, education, and at least two projects for
                    the best results. The more detail you add, the richer your portfolio will be.
                  </p>
                </div>
              )}
            </div>

            {(user?.credits ?? 0) === 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700 p-4">
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  You have 0 credits. They reset every 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Generate button row */}
        <div className="flex items-center justify-between mt-7 pt-5 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground text-sm">Cost per generation:</span>
            <span className="text-primary font-semibold">1 Credit</span>
            <span className="text-muted-foreground text-sm hidden sm:inline">
              ({user?.credits ?? 0} remaining)
            </span>
          </div>

          {/* Generate button — always visible, styled differently when disabled */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || showPreloader}
            className={`
              relative flex items-center gap-2.5 font-bold text-sm rounded-xl
              transition-all duration-200 active:scale-[0.97]
              ${canGenerate && !showPreloader
                ? "px-7 py-3 text-white cursor-pointer"
                : "px-6 py-2.5 cursor-not-allowed"
              }
            `}
            style={
              canGenerate && !showPreloader
                ? {
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow:  "0 4px 20px rgba(99,102,241,0.40)",
                  }
                : {
                    background: "transparent",
                    border: "2px dashed rgba(99,102,241,0.35)",
                    color: "rgba(99,102,241,0.55)",
                  }
            }
            onMouseEnter={(e) => {
              if (!canGenerate || showPreloader) return;
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = "0 8px 32px rgba(99,102,241,0.55)";
              el.style.transform = "translateY(-2px) scale(1.03)";
            }}
            onMouseLeave={(e) => {
              if (!canGenerate || showPreloader) return;
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = "0 4px 20px rgba(99,102,241,0.40)";
              el.style.transform = "";
            }}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            Generate Portfolio
            {!canGenerate && !showPreloader && (
              <span className="text-[10px] font-normal ml-1 opacity-60">
                {!hasInput && !selectedTemplate
                  ? "(add resume + template)"
                  : !hasInput
                  ? "(add resume)"
                  : !selectedTemplate
                  ? "(pick template)"
                  : "(no credits)"}
              </span>
            )}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default GeneratePage;
