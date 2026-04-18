// src/pages/AuthPage.tsx
// Enhancements:
//   - Larger, more premium font sizes throughout (inputs h-12, labels text-xs, headings text-2xl/3xl)
//   - Richer input focus glow + subtle idle border
//   - Submit button: h-12, text-base, stronger glow + scale spring
//   - Panel CTA buttons: shimmer sweep animation on hover, thicker border, stronger glow
//   - Feature list items: larger icon boxes, bigger text
//   - Header pills: slightly larger text
//   - No theme toggle (page is intentionally dark)
//   - All original logic / animations / routing untouched

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Eye, EyeOff, ArrowRight, Loader2,
  Sparkles, Zap, FileText, Download, Star, Shield,
  BrainCircuit,
} from "lucide-react";

// CSS for the shimmer sweep on the panel CTA buttons
const SHIMMER_CSS = `
  @keyframes auth-shimmer {
    0%   { transform: translateX(-120%) skewX(-15deg); }
    100% { transform: translateX(220%) skewX(-15deg); }
  }
  .auth-cta-btn { position: relative; overflow: hidden; }
  .auth-cta-btn .shimmer-sweep {
    position: absolute; inset-y: 0; left: 0; width: 40%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transform: translateX(-120%) skewX(-15deg);
    pointer-events: none;
  }
  .auth-cta-btn:hover .shimmer-sweep {
    animation: auth-shimmer 0.65s ease forwards;
  }
  @keyframes auth-input-pulse {
    0%, 100% { box-shadow: 0 0 0 3px rgba(99,102,241,0.14), 0 0 12px rgba(99,102,241,0.08); }
    50%       { box-shadow: 0 0 0 3px rgba(99,102,241,0.22), 0 0 20px rgba(99,102,241,0.14); }
  }
`;

// ─── Input field ──────────────────────────────────────────────────────────────
const InputField = ({
  label, type, value, onChange, placeholder,
  required, minLength, maxLength, children,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  required?: boolean; minLength?: number; maxLength?: number;
  children?: React.ReactNode;
}) => (
  <div>
    <label
      className="block text-xs font-semibold tracking-[0.14em] uppercase mb-2"
      style={{ color: "rgba(148,163,184,0.8)" }}
    >
      {label}
    </label>
    <div className="relative">
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        minLength={minLength} maxLength={maxLength}
        className="w-full h-12 rounded-xl text-sm outline-none transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.055)",
          border: "1px solid rgba(255,255,255,0.11)",
          color: "#e2e8f0",
          paddingLeft: "1rem",
          paddingRight: children ? "3rem" : "1rem",
          letterSpacing: "0.01em",
        }}
        onFocus={(e) => {
          e.target.style.border = "1px solid rgba(99,102,241,0.75)";
          e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15), 0 0 16px rgba(99,102,241,0.10)";
          e.target.style.background = "rgba(99,102,241,0.07)";
        }}
        onBlur={(e) => {
          e.target.style.border = "1px solid rgba(255,255,255,0.11)";
          e.target.style.boxShadow = "none";
          e.target.style.background = "rgba(255,255,255,0.055)";
        }}
      />
      {children && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{children}</div>
      )}
    </div>
  </div>
);

// ─── Submit button ─────────────────────────────────────────────────────────────
const SubmitButton = ({ loading, label }: { loading: boolean; label: string }) => (
  <motion.button
    type="submit"
    disabled={loading}
    whileHover={{ scale: loading ? 1 : 1.018, boxShadow: loading ? undefined : "0 6px 28px rgba(99,102,241,0.55)" }}
    whileTap={{ scale: loading ? 1 : 0.975 }}
    transition={{ type: "spring", stiffness: 380, damping: 22 }}
    className="w-full h-12 rounded-xl font-semibold text-base flex items-center justify-center gap-2.5 disabled:opacity-50"
    style={{
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #06b6d4 100%)",
      color: "#fff",
      boxShadow: "0 4px 22px rgba(99,102,241,0.40)",
      letterSpacing: "0.01em",
    }}
  >
    {loading
      ? <Loader2 className="w-5 h-5 animate-spin" />
      : <>{label} <ArrowRight className="w-4 h-4" /></>}
  </motion.button>
);

// ─── Feature items on the sliding panel ───────────────────────────────────────
const FEATURES = [
  { icon: Sparkles, text: "AI-powered resume parsing" },
  { icon: FileText, text: "7 professional templates" },
  { icon: Zap,      text: "Generate in under 60 seconds" },
  { icon: Download, text: "Download as standalone HTML" },
  { icon: Star,     text: "5 free credits on signup" },
  { icon: Shield,   text: "Your data stays private" },
];

// ─── Register form ────────────────────────────────────────────────────────────
interface RegProps {
  regName: string; setRegName: (v: string) => void;
  regEmail: string; setRegEmail: (v: string) => void;
  regPassword: string; setRegPassword: (v: string) => void;
  regConfirm: string; setRegConfirm: (v: string) => void;
  showRegPw: boolean; setShowRegPw: (v: boolean) => void;
  agreed: boolean; setAgreed: (v: boolean) => void;
  loading: boolean; onSubmit: (e: React.FormEvent) => void;
  onSwitchToLogin: () => void;
}

const RegisterForm = ({
  regName, setRegName, regEmail, setRegEmail,
  regPassword, setRegPassword, regConfirm, setRegConfirm,
  showRegPw, setShowRegPw, agreed, setAgreed,
  loading, onSubmit, onSwitchToLogin,
}: RegProps) => (
  <>
    <div className="mb-1">
      <h2
        className="text-2xl sm:text-3xl font-bold tracking-tight"
        style={{ color: "#f1f5f9" }}
      >
        Create your account
      </h2>
      <p className="text-sm mt-1.5" style={{ color: "rgba(148,163,184,0.70)" }}>
        Join AI Portfolio Maker and build your portfolio today
      </p>
    </div>

    <form onSubmit={onSubmit} className="space-y-4">
      <InputField
        label="Full Name" type="text" value={regName} onChange={setRegName}
        placeholder="Your full name" required minLength={2} maxLength={50}
      />
      <InputField
        label="Email Address" type="email" value={regEmail} onChange={setRegEmail}
        placeholder="you@example.com" required
      />
      <InputField
        label="Password"
        type={showRegPw ? "text" : "password"}
        value={regPassword} onChange={setRegPassword}
        placeholder="Min 8 chars, 1 uppercase, 1 number" required minLength={8}
      >
        <button
          type="button"
          onClick={() => setShowRegPw(!showRegPw)}
          className="transition-colors"
          style={{ color: "rgba(148,163,184,0.55)" }}
          aria-label={showRegPw ? "Hide password" : "Show password"}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(148,163,184,0.55)")}
        >
          {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </InputField>
      <InputField
        label="Confirm Password" type="password" value={regConfirm}
        onChange={setRegConfirm} placeholder="Repeat your password" required
      />

      <label
        className="flex items-start gap-3 cursor-pointer select-none pt-0.5"
        style={{ color: "rgba(148,163,184,0.70)" }}
      >
        <input
          type="checkbox" checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded shrink-0 accent-indigo-500"
        />
        <span className="text-xs leading-relaxed">
          I agree that my resume will be processed by Google Gemini AI to generate
          portfolio content, and that I own the rights to everything I upload.
        </span>
      </label>

      <div className="pt-0.5">
        <SubmitButton loading={loading} label="Create Account" />
      </div>
    </form>

    <p className="text-center text-sm mt-2 lg:hidden" style={{ color: "rgba(148,163,184,0.6)" }}>
      Already have an account?{" "}
      <button
        onClick={onSwitchToLogin}
        className="font-semibold transition-colors"
        style={{ color: "#a5b4fc" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#c4b5fd")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#a5b4fc")}
      >
        Log in here
      </button>
    </p>
  </>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
type Mode = "login" | "register";

const AuthPage = () => {
  const [mode, setMode]                   = useState<Mode>("login");
  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw]     = useState(false);
  const [loginLoading, setLoginLoading]   = useState(false);
  const [regName, setRegName]             = useState("");
  const [regEmail, setRegEmail]           = useState("");
  const [regPassword, setRegPassword]     = useState("");
  const [regConfirm, setRegConfirm]       = useState("");
  const [showRegPw, setShowRegPw]         = useState(false);
  const [agreed, setAgreed]               = useState(false);
  const [regLoading, setRegLoading]       = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.response?.data?.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally { setLoginLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }
    if (!agreed) {
      toast({
        title: "One more thing",
        description: "Please check the agreement box before continuing.",
        variant: "destructive",
      });
      return;
    }
    setRegLoading(true);
    try {
      await register(regName, regEmail, regPassword);
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Could not create account",
        description: err.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally { setRegLoading(false); }
  };

  const switchToRegister = () => setMode("register");
  const switchToLogin    = () => setMode("login");
  const formIn  = { opacity: 0, x: 20 };
  const formOut = { opacity: 0, x: -20 };

  return (
    <>
      <style>{SHIMMER_CSS}</style>

      <div
        className="min-h-screen flex flex-col"
        style={{ background: "linear-gradient(135deg, #080c18 0%, #0e1525 60%, #0a1020 100%)" }}
      >
        {/* ── Navbar ───────────────────────────────────────────────────────── */}
        <header className="shrink-0 border-b border-white/[0.08] bg-transparent">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-base tracking-tight hidden sm:block whitespace-nowrap">
                AI Portfolio Maker
              </span>
            </Link>

            {/* Center info pills */}
            <div className="hidden md:flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.30)",
                }}
              >
                <Star className="w-3 h-3 text-indigo-300" />
                <span className="text-[11px] font-semibold text-indigo-300 tracking-wide">
                  5 free credits
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <Sparkles className="w-3 h-3 text-white/50" />
                <span
                  className="text-[11px] font-medium tracking-wide"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Powered by Gemini AI
                </span>
              </div>
            </div>

            {/* Back link */}
            <Link
              to="/"
              className="text-sm font-medium transition-all px-3 py-2 rounded-lg"
              style={{ color: "rgba(255,255,255,0.55)" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.color = "#fff";
                el.style.background = "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.color = "rgba(255,255,255,0.55)";
                el.style.background = "transparent";
              }}
            >
              Back to home
            </Link>
          </div>
        </header>

        {/* ── Page body ────────────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-4">
          {/* Background glows */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)" }}
            />
            <div
              className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)" }}
            />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
            style={{
              background: "rgba(12,17,30,0.94)",
              border: "1px solid rgba(99,102,241,0.22)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 60px rgba(99,102,241,0.07)",
              backdropFilter: "blur(24px)",
              minHeight: 580,
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[580px]">
              {/* Form panel */}
              <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 order-2 lg:order-1">
                <AnimatePresence mode="wait">
                  {mode === "login" ? (
                    <motion.div
                      key="login"
                      initial={formIn} animate={{ opacity: 1, x: 0 }}
                      exit={formOut} transition={{ duration: 0.28, ease: "easeOut" }}
                      className="w-full max-w-sm space-y-4"
                    >
                      <div>
                        <h2
                          className="text-2xl sm:text-3xl font-bold tracking-tight"
                          style={{ color: "#f1f5f9" }}
                        >
                          Welcome back
                        </h2>
                        <p className="text-sm mt-1.5" style={{ color: "rgba(148,163,184,0.70)" }}>
                          Sign in to your account to continue
                        </p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <InputField
                          label="Email Address" type="email" value={loginEmail}
                          onChange={setLoginEmail} placeholder="you@example.com" required
                        />
                        <InputField
                          label="Password"
                          type={showLoginPw ? "text" : "password"}
                          value={loginPassword} onChange={setLoginPassword}
                          placeholder="Your password" required
                        >
                          <button
                            type="button"
                            onClick={() => setShowLoginPw(!showLoginPw)}
                            className="transition-colors"
                            style={{ color: "rgba(148,163,184,0.55)" }}
                            aria-label={showLoginPw ? "Hide password" : "Show password"}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(148,163,184,0.55)")}
                          >
                            {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </InputField>
                        <div className="pt-0.5">
                          <SubmitButton loading={loginLoading} label="Log In" />
                        </div>
                      </form>

                      <p className="text-center text-sm lg:hidden" style={{ color: "rgba(148,163,184,0.6)" }}>
                        New here?{" "}
                        <button
                          onClick={switchToRegister}
                          className="font-semibold transition-colors"
                          style={{ color: "#a5b4fc" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#c4b5fd")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#a5b4fc")}
                        >
                          Create an account
                        </button>
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register-mobile"
                      initial={formIn} animate={{ opacity: 1, x: 0 }}
                      exit={formOut} transition={{ duration: 0.28, ease: "easeOut" }}
                      className="w-full max-w-sm space-y-4 lg:hidden"
                    >
                      <RegisterForm
                        regName={regName} setRegName={setRegName}
                        regEmail={regEmail} setRegEmail={setRegEmail}
                        regPassword={regPassword} setRegPassword={setRegPassword}
                        regConfirm={regConfirm} setRegConfirm={setRegConfirm}
                        showRegPw={showRegPw} setShowRegPw={setShowRegPw}
                        agreed={agreed} setAgreed={setAgreed}
                        loading={regLoading} onSubmit={handleRegister}
                        onSwitchToLogin={switchToLogin}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop register panel */}
              <div className="hidden lg:flex items-center justify-center p-8 lg:p-12 order-1 lg:order-2">
                <AnimatePresence mode="wait">
                  {mode === "register" && (
                    <motion.div
                      key="register-desktop"
                      initial={formIn} animate={{ opacity: 1, x: 0 }}
                      exit={formOut} transition={{ duration: 0.28, ease: "easeOut" }}
                      className="w-full max-w-sm space-y-4"
                    >
                      <RegisterForm
                        regName={regName} setRegName={setRegName}
                        regEmail={regEmail} setRegEmail={setRegEmail}
                        regPassword={regPassword} setRegPassword={setRegPassword}
                        regConfirm={regConfirm} setRegConfirm={setRegConfirm}
                        showRegPw={showRegPw} setShowRegPw={setShowRegPw}
                        agreed={agreed} setAgreed={setAgreed}
                        loading={regLoading} onSubmit={handleRegister}
                        onSwitchToLogin={switchToLogin}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Sliding animated panel ─────────────────────────────────── */}
            <motion.div
              animate={{ left: mode === "login" ? "50%" : "0%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="hidden lg:flex absolute top-0 bottom-0 w-1/2 flex-col items-center justify-center p-10 z-20"
              style={{
                background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 35%, #1e3a5f 65%, #0e7490 100%)",
                borderRadius: mode === "login" ? "0 16px 16px 0" : "16px 0 0 16px",
              }}
            >
              {/* Decorative rings */}
              <div
                className="absolute top-[-60px] right-[-60px] w-48 h-48 rounded-full opacity-20"
                style={{ border: "1px solid rgba(255,255,255,0.4)" }}
              />
              <div
                className="absolute bottom-[-40px] left-[-40px] w-36 h-36 rounded-full opacity-15"
                style={{ border: "1px solid rgba(255,255,255,0.3)" }}
              />

              <div className="relative z-10 text-center space-y-7 w-full">
                {/* Brand mark */}
                <motion.div
                  key={mode + "-logo"}
                  initial={{ scale: 0.88, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.08, duration: 0.35 }}
                  className="flex items-center justify-center gap-3"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-white text-base leading-tight whitespace-nowrap">
                    AI Portfolio Maker
                  </span>
                </motion.div>

                {/* Headline */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode + "-headline"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-2.5"
                  >
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>
                      {mode === "login"
                        ? "Join thousands of professionals building standout portfolios with AI."
                        : "Log back in to access your portfolios and credits."}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Feature list */}
                <AnimatePresence>
                  {mode === "login" && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="space-y-3 text-left"
                    >
                      {FEATURES.map((f, i) => (
                        <motion.div
                          key={f.text}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.04 * i, duration: 0.25 }}
                          className="flex items-center gap-3 text-sm"
                          style={{ color: "rgba(255,255,255,0.82)" }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: "rgba(255,255,255,0.13)" }}
                          >
                            <f.icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          {f.text}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA button with shimmer sweep */}
                <button
                  onClick={mode === "login" ? switchToRegister : switchToLogin}
                  className="auth-cta-btn w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1.5px solid rgba(255,255,255,0.35)",
                    color: "#fff",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 2px 14px rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget;
                    btn.style.background = "rgba(255,255,255,0.20)";
                    btn.style.border = "1.5px solid rgba(255,255,255,0.55)";
                    btn.style.boxShadow = "0 6px 28px rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.1)";
                    btn.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget;
                    btn.style.background = "rgba(255,255,255,0.12)";
                    btn.style.border = "1.5px solid rgba(255,255,255,0.35)";
                    btn.style.boxShadow = "0 2px 14px rgba(255,255,255,0.04)";
                    btn.style.transform = "translateY(0)";
                  }}
                >
                  <span className="shimmer-sweep" />
                  {mode === "login" ? "Create Account" : "Log In Instead"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
