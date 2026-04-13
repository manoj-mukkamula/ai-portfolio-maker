// src/pages/ContactPage.tsx
// Updated with real contact info: manojmukkamula2@gmail.com, GitHub, LinkedIn

import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { BrainCircuit, Sun, Moon, ArrowLeft, Github, Mail, Linkedin, MessageSquare } from "lucide-react";
import { useState } from "react";

const ContactPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Opens the user's mail client with a pre-filled email to Manoj
    const subject = encodeURIComponent(`Message from ${form.name} via AI Portfolio Maker`);
    const body    = encodeURIComponent(`Hi Manoj,\n\n${form.message}\n\nFrom: ${form.name}\nEmail: ${form.email}`);
    window.open(`mailto:manojmukkamula2@gmail.com?subject=${subject}&body=${body}`, "_blank");
    setSubmitted(true);
  };

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
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-12 text-center">
          <p className="text-[11px] tracking-widest text-primary font-semibold uppercase mb-3">Get in touch</p>
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Contact</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Found a bug, have a feature request, or just want to say something? Pick the channel that works best for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground text-sm mb-4">Reach out directly</h2>
              <div className="space-y-2">
                {[
                  {
                    icon: Github,
                    label: "GitHub",
                    value: "manoj-mukkamula",
                    href: "https://github.com/manoj-mukkamula/",
                    note: "Issues and PRs welcome",
                  },
                  {
                    icon: Linkedin,
                    label: "LinkedIn",
                    value: "manoj-mukkamula",
                    href: "https://www.linkedin.com/in/manoj-mukkamula/",
                    note: "Connect professionally",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "manojmukkamula2@gmail.com",
                    href: "mailto:manojmukkamula2@gmail.com",
                    note: "For detailed questions",
                  },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <link.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {link.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{link.note}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-foreground text-sm">Fastest way to reach me</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For bugs or feature suggestions, opening a{" "}
                <a
                  href="https://github.com/manoj-mukkamula/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  GitHub issue
                </a>{" "}
                is the quickest path to a fix. For anything else, the form or email works great.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-7">
              {submitted ? (
                <div className="text-center py-10">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                  >
                    ✓
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Email client opened!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your default mail app should have opened with a pre-filled message. If it didn't,
                    you can email{" "}
                    <a
                      href="mailto:manojmukkamula2@gmail.com"
                      className="text-primary hover:underline font-medium"
                    >
                      manojmukkamula2@gmail.com
                    </a>{" "}
                    directly.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", message: "" }); }}
                    className="mt-5 text-sm text-primary font-medium hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-bold text-foreground text-base mb-1">Send a message</h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    Clicking send will open your mail client with the message pre-filled.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Your name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Arjun Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Email address</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="arjun@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Message</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Hi Manoj, I noticed that..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                    >
                      Send message
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
