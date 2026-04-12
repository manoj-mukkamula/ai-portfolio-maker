// src/pages/GeneratePage.tsx

import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { portfolioApi } from "@/lib/api";
import { TEMPLATES } from "@/lib/templates";
import {
  Upload, FileText, Sparkles, Info, Loader2,
  CheckCircle, Cpu, ChevronDown, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Skeleton shimmer shown in preview panel while generating ───────────────
const GENERATION_STEPS = [
  "Parsing your resume...",
  "Extracting key details...",
  "Crafting your story...",
  "Applying design template...",
  "Finalising your portfolio...",
];

function GenerationSkeleton({ templateName }: { templateName: string }) {
  const [stepIndex, setStepIndex] = useState(0);

  // Cycle through steps every 3.5 seconds
  useState(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % GENERATION_STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  });

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
      {/* Mock browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-card">
        <span className="w-2 h-2 rounded-full bg-red-400/70" />
        <span className="w-2 h-2 rounded-full bg-yellow-400/70" />
        <span className="w-2 h-2 rounded-full bg-green-400/70" />
        <div className="flex-1 h-4 mx-2 rounded-md bg-secondary animate-pulse" />
      </div>

      {/* Skeleton body */}
      <div className="flex-1 overflow-hidden p-3 space-y-2.5">
        {/* Hero / header skeleton */}
        <div className="h-16 rounded-lg bg-secondary animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shimmer" />
        </div>

        {/* Nav skeleton */}
        <div className="flex gap-2">
          {[40, 56, 48, 44].map((w, i) => (
            <div key={i} className="h-3 rounded-full bg-secondary animate-pulse" style={{ width: `${w}px`, animationDelay: `${i * 80}ms` }} />
          ))}
        </div>

        {/* About section */}
        <div className="h-3 rounded-full bg-secondary animate-pulse w-1/3" />
        <div className="space-y-1.5">
          {[100, 90, 85, 75].map((w, i) => (
            <div key={i} className="h-2.5 rounded-full bg-secondary animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }} />
          ))}
        </div>

        {/* Skills chips */}
        <div className="h-3 rounded-full bg-secondary animate-pulse w-1/4 mt-1" />
        <div className="flex flex-wrap gap-1.5">
          {[52, 68, 44, 60, 48, 72, 40].map((w, i) => (
            <div key={i} className="h-5 rounded-full bg-secondary animate-pulse" style={{ width: `${w}px`, animationDelay: `${i * 50}ms` }} />
          ))}
        </div>

        {/* Project cards */}
        <div className="h-3 rounded-full bg-secondary animate-pulse w-1/4 mt-1" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-lg bg-secondary animate-pulse p-2 space-y-1.5" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="h-2.5 rounded-full bg-muted-foreground/20 w-3/4" />
              <div className="h-2 rounded-full bg-muted-foreground/15 w-full" />
              <div className="h-2 rounded-full bg-muted-foreground/15 w-5/6" />
            </div>
          ))}
        </div>

        {/* Experience block */}
        <div className="h-3 rounded-full bg-secondary animate-pulse w-1/3 mt-1" />
        <div className="rounded-lg bg-secondary animate-pulse p-2 space-y-1.5">
          <div className="h-2.5 rounded-full bg-muted-foreground/20 w-1/2" />
          <div className="h-2 rounded-full bg-muted-foreground/15 w-full" />
          <div className="h-2 rounded-full bg-muted-foreground/15 w-4/5" />
        </div>
      </div>

      {/* Status footer */}
      <div className="px-3 py-2.5 border-t border-border bg-card flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
        <span className="text-xs text-muted-foreground truncate transition-all duration-500">
          {GENERATION_STEPS[stepIndex]}
        </span>
        <div className="ml-auto flex gap-1 shrink-0">
          {GENERATION_STEPS.map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-500"
              style={{ background: i === stepIndex ? "#6366f1" : "#e5e7eb" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main GeneratePage ──────────────────────────────────────────────────────
const GeneratePage = () => {
  const { refreshUser, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [tipOpen, setTipOpen] = useState(true);

  const isSubmitting = useRef(false);
  const selectedTpl = TEMPLATES.find((t) => t.id === selectedTemplate);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && (f.type === "application/pdf" || f.name.endsWith(".docx"))) {
        setFile(f);
      } else {
        toast({ title: "Invalid file type", description: "Only PDF and DOCX files are accepted.", variant: "destructive" });
      }
    },
    [toast]
  );

  const handleGenerate = async () => {
    if (isSubmitting.current) return;
    if (!selectedTemplate) {
      toast({ title: "Select a template", description: "Choose a template before generating.", variant: "destructive" });
      return;
    }
    if (tab === "upload" && !file) {
      toast({ title: "Upload resume", description: "Upload a PDF or DOCX file.", variant: "destructive" });
      return;
    }
    if (tab === "paste" && !resumeText.trim()) {
      toast({ title: "Resume text missing", description: "Paste your resume text above.", variant: "destructive" });
      return;
    }
    if ((user?.credits ?? 0) <= 0) {
      toast({ title: "No credits", description: "You have no credits remaining.", variant: "destructive" });
      return;
    }

    isSubmitting.current = true;
    setGenerating(true);

    try {
      let res;
      if (tab === "upload" && file) {
        const fd = new FormData();
        fd.append("resume", file);
        fd.append("template", selectedTpl!.template);
        fd.append("templateName", selectedTpl!.id);
        res = await portfolioApi.generate(fd);
      } else {
        res = await portfolioApi.generate({ resumeText, template: selectedTpl!.template, templateName: selectedTpl!.id });
      }
      await refreshUser();
      const pid = res.data.portfolio?.id || res.data.portfolio?._id;
      toast({ title: "Portfolio generated!", description: "Redirecting to preview..." });
      navigate(`/preview/${pid}`);
    } catch (err: any) {
      toast({
        title: "Generation failed",
        description: err.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      isSubmitting.current = false;
      setGenerating(false);
    }
  };

  const hasInput = tab === "upload" ? !!file : resumeText.trim().length > 0;
  const canGenerate = hasInput && !!selectedTemplate && (user?.credits ?? 0) > 0 && !generating;
  const charCount = resumeText.length;
  const charColor =
    charCount === 0
      ? "text-muted-foreground"
      : charCount < 100
      ? "text-red-500"
      : charCount < 200
      ? "text-amber-500"
      : "text-green-500";

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Page Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <p className="text-[11px] tracking-widest text-primary font-semibold uppercase">Gemini AI Engine</p>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-0.5">Portfolio Generator</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl">
            Upload your resume and let Google Gemini AI extract your details and build a professional portfolio website automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-5">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {(["upload", "paste"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "upload" ? "Upload File" : "Paste Text"}
                </button>
              ))}
            </div>

            {/* Upload or paste */}
            {tab === "upload" ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`rounded-xl p-8 text-center transition-all duration-200 ${
                  dragOver
                    ? "border-2 border-primary bg-primary/5 shadow-[0_0_0_4px_rgba(99,102,241,0.08)]"
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
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
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
                      className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-200 ${dragOver ? "scale-110" : ""}`}
                      style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))", border: "1px solid rgba(99,102,241,0.2)" }}
                    >
                      <Upload className={`w-5 h-5 text-primary transition-transform duration-200 ${dragOver ? "scale-110" : ""}`} />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Drag and drop your resume here</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">PDF or DOCX format, max 5MB</p>
                    <label className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-sm font-medium cursor-pointer hover:bg-secondary hover:border-primary/30 transition-all">
                      Select File
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
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
                  placeholder={`Paste your resume text here...\n\nFor best results, include:\nName: Rohan Mehta\nEmail: rohan@example.com\nPhone: +91 98765 43210\nSkills: React, Node.js, MongoDB, TypeScript\nEducation: B.Tech CSE, 2025\nExperience: Software Intern at XYZ (2024)\nProjects: AI Resume Analyzer, Real-time Chat App`}
                  rows={11}
                  className="w-full rounded-xl bg-secondary border border-border p-4 text-sm text-foreground placeholder:text-muted-foreground/45 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className={`text-xs ${charColor} font-medium transition-colors`}>
                    {charCount} characters
                    {charCount < 200 && charCount > 0 && " — add more for richer results"}
                    {charCount >= 200 && " — looking good!"}
                  </p>
                  <p className="text-xs text-muted-foreground">AI works best with 200+ characters</p>
                </div>
              </div>
            )}

            {/* Template grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-foreground">Select Template</h2>
                <span className="text-xs text-muted-foreground">{TEMPLATES.length} templates available</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`text-left rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                      selectedTemplate === tpl.id
                        ? "border-primary shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                        : "border-border hover:border-primary/30 hover:shadow-elevated"
                    }`}
                    style={selectedTemplate === tpl.id ? { background: "rgba(99,102,241,0.03)" } : {}}
                  >
                    <div className="h-24 rounded-t-lg overflow-hidden bg-secondary relative">
                      <iframe
                        srcDoc={tpl.template}
                        title={tpl.name}
                        className="w-full h-full border-0 pointer-events-none"
                        style={{ transform: "scale(0.4)", transformOrigin: "top left", width: "250%", height: "250%" }}
                        sandbox="allow-same-origin allow-scripts"
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
                        <p className="text-[10px] text-muted-foreground tracking-wide uppercase">{tpl.style}</p>
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

          {/* Right column — sticky preview */}
          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Preview panel */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {generating ? "Generating..." : "Live Preview"}
                  </span>
                </div>
                {selectedTpl && !generating && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {selectedTpl.name}
                  </span>
                )}
                {generating && (
                  <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse">
                    AI Working
                  </span>
                )}
              </div>

              {/* Preview content area */}
              <div className="h-72 overflow-hidden relative">
                {generating ? (
                  <GenerationSkeleton templateName={selectedTpl?.name ?? ""} />
                ) : selectedTpl ? (
                  <iframe
                    srcDoc={selectedTpl.template}
                    title="Template Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin allow-scripts"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-secondary text-center px-6">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-border flex items-center justify-center mx-auto mb-2">
                        <FileText className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">Select a template to preview</p>
                      <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-1">Preview renders here</p>
                    </div>
                  </div>
                )}
              </div>

              {file && !generating && (
                <div className="px-4 py-2 border-t border-border flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground truncate">Ready: {file.name}</span>
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
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${tipOpen ? "rotate-180" : ""}`} />
              </button>
              {tipOpen && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Include your name, email, skills, education, and projects for the best results. The more detail you provide, the richer your portfolio will be.
                  </p>
                </div>
              )}
            </div>

            {/* Credit warning */}
            {(user?.credits ?? 0) === 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700 p-4">
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  You have 0 credits remaining. Credits reset every 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Generate button — ALWAYS VISIBLE, state changes only */}
        <div className="flex items-center justify-between mt-7 pt-5 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground text-sm">Cost per generation:</span>
            <span className="text-primary font-semibold">1 Credit</span>
            <span className="text-muted-foreground text-sm hidden sm:inline">
              ({user?.credits ?? 0} remaining)
            </span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !canGenerate}
            className="px-7 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-[0.98]"
            style={{
              background: canGenerate
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "var(--color-secondary, #e5e7eb)",
              color: canGenerate ? "#fff" : "var(--color-muted-foreground, #6b7280)",
              boxShadow: canGenerate ? "0 4px 20px rgba(99,102,241,0.35)" : "none",
              opacity: generating ? 0.8 : 1,
              cursor: generating || !canGenerate ? "not-allowed" : "pointer",
            }}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Portfolio
              </>
            )}
          </button>
        </div>
      </div>

      {/* Shimmer keyframes */}
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          animation: skeleton-shimmer 1.6s ease-in-out infinite;
        }
      `}</style>
    </AppLayout>
  );
};

export default GeneratePage;