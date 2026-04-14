// src/pages/ContactPage.tsx
// Uses shared AppNavbar, larger text, fixed mailto with fallback toast

import { useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import { Github, Mail, Linkedin, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm]           = useState({ name: "", email: "", message: "" });
  const [sending, setSending]     = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setSending(true);
    const subject    = encodeURIComponent(`Message from ${form.name} via AI Portfolio Maker`);
    const body       = encodeURIComponent(`Hi Manoj,\n\n${form.message}\n\n---\nFrom: ${form.name}\nReply-to: ${form.email}`);
    const mailtoUrl  = `mailto:manojmukkamula2@gmail.com?subject=${subject}&body=${body}`;

    const a = document.createElement("a");
    a.href  = mailtoUrl;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Detect if mail client opened (blur = window lost focus)
    let opened = false;
    const onBlur = () => {
      opened = true;
      window.removeEventListener("blur", onBlur);
      setSending(false);
      setSubmitted(true);
    };
    window.addEventListener("blur", onBlur);

    // Fallback if mail client never opened
    setTimeout(() => {
      window.removeEventListener("blur", onBlur);
      setSending(false);
      if (!opened) {
        toast({
          title: "No email client detected",
          description: "Email manojmukkamula2@gmail.com directly to get in touch.",
        });
        setSubmitted(true);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar backOnly />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="text-sm tracking-widest text-primary font-semibold uppercase mb-3">Get in touch</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4 tracking-tight">Say hello</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Found a bug, have a feature request, or just want to chat? Pick the channel that works best for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — contact info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-7 shadow-card">
              <h2 className="text-base font-bold text-foreground mb-5">Reach out directly</h2>
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
                    className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-secondary transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <link.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{link.label}</p>
                      <p className="text-sm text-muted-foreground truncate">{link.value}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">{link.note}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5">
              <p className="text-sm font-semibold text-primary mb-2">Response time</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is a student project. GitHub Issues get the fastest response. Email typically
                takes a day or two.
              </p>
            </div>
          </div>

          {/* Right — message form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Message sent!</h3>
                    <p className="text-base text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      Your mail client should have opened with the message pre-filled. If it didn't,
                      email <span className="text-primary font-medium">manojmukkamula2@gmail.com</span> directly.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", message: "" }); }}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-base font-bold text-foreground mb-6">Send a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Name</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Tell me what's on your mind..."
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full py-3.5 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                    >
                      {sending ? (
                        <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Opening mail client...</>
                      ) : (
                        <><Mail className="w-5 h-5" /> Send message</>
                      )}
                    </button>
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                      Clicking "Send message" opens your default mail app with this pre-filled.
                      If no mail app is configured, use the email address on the left.
                    </p>
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
