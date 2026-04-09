// src/pages/GeneratePage.tsx
// Portfolio generation page.
// Users upload a resume PDF/DOCX or paste text, select a template,
// and the backend calls Gemini AI to produce a personalized portfolio HTML.

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { portfolioApi } from "@/lib/api";
import { TEMPLATES } from "@/lib/templates";
import { Upload, FileText, Sparkles, Info, Loader2, CheckCircle, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const selectedTpl = TEMPLATES.find((t) => t.id === selectedTemplate);

  // Handle drag-and-drop file upload
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && (f.type === "application/pdf" || f.name.endsWith(".docx"))) {
        setFile(f);
      } else {
        toast({
          title: "Invalid file type",
          description: "Only PDF and DOCX files are accepted.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Submit generation request
  const handleGenerate = async () => {
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

    setGenerating(true);
    try {
      let res;
      if (tab === "upload" && file) {
        // Send as multipart form data with PDF/DOCX file
        const fd = new FormData();
        fd.append("resume", file);
        fd.append("template", selectedTpl!.template);
        fd.append("templateName", selectedTpl!.id);
        res = await portfolioApi.generate(fd);
      } else {
        // Send as JSON with pasted resume text
        res = await portfolioApi.generate({
          resumeText,
          template: selectedTpl!.template,
          templateName: selectedTpl!.id,
        });
      }

      await refreshUser(); // Refresh credit count in sidebar
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
      setGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-4 h-4 text-primary" />
            <p className="text-xs tracking-widest text-primary font-semibold uppercase">
              Gemini AI Engine
            </p>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mt-1">
            Portfolio Generator
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Upload your resume and let Google Gemini AI extract your details and build a
            professional portfolio website automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Input + Templates */}
          <div className="lg:col-span-3 space-y-6">
            {/* Input tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setTab("upload")}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === "upload"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setTab("paste")}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === "paste"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                }`}
              >
                Paste Text
              </button>
            </div>

            {/* File upload area */}
            {tab === "upload" ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                  dragOver ? "border-primary bg-sidebar-accent" : "border-border"
                }`}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      onClick={() => setFile(null)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto text-primary mb-3" />
                    <p className="font-semibold text-foreground">Drag & Drop Resume</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      PDF or DOCX format · Max 5MB
                    </p>
                    <label className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-sm font-medium cursor-pointer hover:bg-secondary transition-colors">
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
                  placeholder={`Paste your resume text here...\n\nExample:\nName: Manoj Kumar\nEmail: manoj@example.com\nSkills: React, Node.js, MongoDB\nEducation: B.Tech CSE, 2025\nProjects: AI Resume Analyzer, Chat App`}
                  rows={12}
                  className="w-full rounded-xl bg-secondary border-0 p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary outline-none resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {resumeText.length} characters — AI works best with 200+ characters
                </p>
              </div>
            )}

            {/* Template grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-display font-bold text-foreground">
                  Select Template
                </h2>
                <span className="text-xs text-muted-foreground">
                  {TEMPLATES.length} templates available
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                      selectedTemplate === tpl.id
                        ? "border-primary bg-sidebar-accent"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {/* Template mini-preview via scaled iframe */}
                    <div className="h-28 rounded-lg overflow-hidden bg-secondary mb-3 relative">
                      <iframe
                        srcDoc={tpl.template}
                        title={tpl.name}
                        className="w-full h-full border-0 pointer-events-none"
                        style={{ transform: "scale(0.4)", transformOrigin: "top left", width: "250%", height: "250%" }}
                        sandbox="allow-same-origin"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{tpl.name}</p>
                        <p className="text-xs text-muted-foreground tracking-wide uppercase">
                          {tpl.style}
                        </p>
                      </div>
                      {tpl.premium && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent text-accent-foreground uppercase">
                          Premium
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live Preview + AI tip */}
          <div className="lg:col-span-2 space-y-4">
            {/* Live preview panel */}
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
              </div>
              <div className="h-80 flex items-center justify-center bg-secondary overflow-hidden">
                {selectedTpl ? (
                  <iframe
                    srcDoc={selectedTpl.template}
                    title="Template Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Select a template to preview</p>
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-1">
                      Template preview renders here
                    </p>
                  </div>
                )}
              </div>
              {file && (
                <div className="px-4 py-2 border-t border-border flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">Synced to {file.name}</span>
                </div>
              )}
            </div>

            {/* AI Tip */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-card">
              <div className="flex gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-foreground">AI Tip</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Include your name, email, skills, education, and projects in the resume for
                    the best results. The more detail you provide, the richer your portfolio
                    will be.
                  </p>
                </div>
              </div>
            </div>

            {/* Credit warning */}
            {(user?.credits ?? 0) === 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700 p-4">
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  ⚠️ You have 0 credits remaining. Contact the admin to top up.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button row */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Cost per generation:</span>
            <span className="text-primary font-semibold">1 Credit</span>
            <span className="text-muted-foreground">
              (You have {user?.credits ?? 0} remaining)
            </span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || (user?.credits ?? 0) === 0}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating with AI...
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
    </AppLayout>
  );
};

export default GeneratePage;