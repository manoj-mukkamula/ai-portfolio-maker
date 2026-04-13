// src/pages/AboutPage.tsx
// Simple, professional About page for the AI Portfolio Maker project

import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { BrainCircuit, Sun, Moon, ArrowLeft, Sparkles, Cpu, Code2, GraduationCap } from "lucide-react";

const AboutPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground text-sm">AI Portfolio Maker</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[11px] tracking-widest text-primary font-semibold uppercase mb-3">About the project</p>
          <h1 className="text-4xl font-extrabold text-foreground mb-4">
            What is AI Portfolio Maker?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            AI Portfolio Maker is a final-year engineering project that demonstrates the practical application of large
            language models in real-world product development. It lets anyone turn their resume into a polished,
            professionally designed portfolio website in under a minute.
          </p>
        </div>

        {/* Story */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-12">
          <div className="bg-card border border-border rounded-2xl p-7 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground">The project background</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Building a portfolio website from scratch takes hours of design decisions, coding, and content writing.
              Most students and early-career professionals skip it entirely because it feels overwhelming.
              This project was built to solve that exact problem by using AI to do the heavy lifting automatically.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-7 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground">How it works under the hood</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you upload a resume, the backend parses the file content and sends it to Google Gemini along with
              a structured prompt. Gemini reads your experience, education, skills, and projects, then generates
              formatted HTML content that gets injected into the selected template. The result is a complete,
              self-contained portfolio page delivered in seconds.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground">Technology stack</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Frontend", "React, TypeScript, Tailwind CSS"],
                ["Backend",  "Node.js, Express, MongoDB"],
                ["AI Engine", "Google Gemini 1.5 Pro"],
                ["Auth",    "JWT with bcrypt password hashing"],
                ["File parsing", "PDF and DOCX resume support"],
                ["Deployment", "Vite build, REST API"],
              ].map(([label, value]) => (
                <div key={label} className="p-3 bg-secondary/50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">{label}</p>
                  <p className="text-xs font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Sparkles className="w-4 h-4" />
            Try it yourself
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
