// src/pages/AboutPage.tsx
import { Link } from "react-router-dom";
import SharedNavbar from "@/components/SharedNavbar";
import { Sparkles, Cpu, Code2, GraduationCap, ArrowRight } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SharedNavbar variant="public" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="mb-14">
          <p className="text-xs tracking-widest text-primary font-semibold uppercase mb-3">About the project</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-5 tracking-tight">
            What is AI Portfolio Maker?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            AI Portfolio Maker is a final-year engineering project that shows what's possible when you combine
            modern AI with practical product thinking. Upload a resume, pick a template, and get a
            professionally designed portfolio website in under a minute.
          </p>
        </div>

        {/* Story card */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">The background</h2>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            Building a portfolio site from scratch takes hours of design decisions, HTML, CSS, and content
            writing. Most students either skip it entirely or end up with a template that looks generic.
            This project exists to close that gap.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Powered by Google Gemini, it reads your resume and automatically extracts your name, skills,
            projects, experience, and education, then drops that content into a hand-crafted HTML template.
            The result is a portfolio that feels personal, even though the heavy lifting is handled by AI.
          </p>
        </div>

        {/* Tech stack */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-violet-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Tech stack</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Frontend",  value: "React + TypeScript + Tailwind CSS" },
              { label: "Backend",   value: "Node.js + Express + MongoDB"        },
              { label: "AI Engine", value: "Google Gemini 1.5 Flash API"        },
              { label: "Auth",      value: "JWT + bcrypt"                        },
              { label: "Hosting",   value: "Deployable on any Node host"         },
              { label: "Templates", value: "10 custom HTML/CSS designs"          },
            ].map((item) => (
              <div key={item.label} className="bg-secondary/50 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated hover:bg-secondary/80 cursor-default">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-10 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">What it does</h2>
          </div>
          <ul className="space-y-3">
            {[
              "Parses PDF and DOCX resume files automatically",
              "Extracts structured data using Gemini 1.5 Flash AI",
              "Supports 10 portfolio templates with distinct visual styles",
              "Lets you edit the generated HTML directly in the browser",
              "Exports a self-contained HTML file you can host anywhere",
              "Includes a credit system with daily reset to keep usage fair",
            ].map((feat) => (
              <li key={feat} className="flex items-start gap-3 text-base text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-white font-bold text-base hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Cpu className="w-5 h-5" />
            Try it yourself
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
