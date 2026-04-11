// src/pages/AuthPage.tsx
//
// REPLACES LoginPage.tsx and RegisterPage.tsx with a single animated page.
//
// Layout: two-column card with a decorative left panel and a right content area.
// Clicking "Sign Up" or "Sign In" slides the decorative panel left or right
// using Framer Motion, revealing the other form with a smooth fade+slide.
//
// Auth logic is 100% unchanged — same useAuth().login() and useAuth().register()
// calls, same validation, same error toasts, same navigate("/dashboard").
//
// Route change: /login and /register both point to this component (see App.tsx).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Eye, EyeOff, ArrowRight, Loader2,
  Sparkles, Zap, FileText, Download, Star, Shield
} from "lucide-react";

// ── tiny helpers ────────────────────────────────────────────────────────────

const InputField = ({
  label, type, value, onChange, placeholder, required, minLength, maxLength, children,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  children?: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase"
      style={{ color: "rgba(148,163,184,0.7)" }}>
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all pr-11"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#e2e8f0",
        }}
        onFocus={(e) => {
          e.target.style.border = "1px solid rgba(99,102,241,0.6)";
          e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
        }}
        onBlur={(e) => {
          e.target.style.border = "1px solid rgba(255,255,255,0.1)";
          e.target.style.boxShadow = "none";
        }}
      />
      {children && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{children}</div>
      )}
    </div>
  </div>
);

// ── Feature list shown on the decorative panel ───────────────────────────────

const FEATURES = [
  { icon: Sparkles, text: "AI-powered resume parsing" },
  { icon: FileText, text: "6 professional templates" },
  { icon: Zap,      text: "Generate in under 60 seconds" },
  { icon: Download, text: "Download as standalone HTML" },
  { icon: Star,     text: "5 free credits per day" },
  { icon: Shield,   text: "Your data stays private" },
];

// ── Main component ───────────────────────────────────────────────────────────

type Mode = "login" | "register";

const AuthPage = () => {
  const [mode, setMode] = useState<Mode>("login");

  // Login state
  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw]     = useState(false);
  const [loginLoading, setLoginLoading]   = useState(false);

  // Register state
  const [regName, setRegName]             = useState("");
  const [regEmail, setRegEmail]           = useState("");
  const [regPassword, setRegPassword]     = useState("");
  const [regConfirm, setRegConfirm]       = useState("");
  const [showRegPw, setShowRegPw]         = useState(false);
  const [agreed, setAgreed]              = useState(false);
  const [regLoading, setRegLoading]       = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Handlers (untouched auth logic) ─────────────────────────────────────

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
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!agreed) {
      toast({ title: "Error", description: "Please agree to the Terms.", variant: "destructive" });
      return;
    }
    setRegLoading(true);
    try {
      await register(regName, regEmail, regPassword);
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.response?.data?.message || "Could not create account.",
        variant: "destructive",
      });
    } finally {
      setRegLoading(false);
    }
  };

  // ── Animation variants ───────────────────────────────────────────────────

  // The decorative panel slides left (x: 0%) for login, right (x: 100%) for register
  const panelVariants = {
    login:    { x: "0%"   },
    register: { x: "100%" },
  };

  const formVariants = {
    hidden:  { opacity: 0, x: mode === "login" ? 24 : -24 },
    visible: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: mode === "login" ? -24 : 24 },
  };

  // ── Submit button ────────────────────────────────────────────────────────

  const SubmitButton = ({ loading, label }: { loading: boolean; label: string }) => (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.015 }}
      whileTap={{ scale: loading ? 1 : 0.985 }}
      className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
      style={{
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
        color: "#fff",
        boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
      }}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </motion.button>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0b0f1a 0%, #111827 60%, #0d1424 100%)" }}
    >
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{
          background: "rgba(15,20,35,0.9)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          minHeight: 580,
        }}
      >
        {/* Two-column inner grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[580px]">

          {/* ── Left column: login form ────────────────────────────────── */}
          <div className="flex items-center justify-center p-8 lg:p-12 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div
                  key="login-form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full max-w-sm space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>
                      Welcome back
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.7)" }}>
                      Sign in to your account to continue
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <InputField
                      label="Email Address"
                      type="email"
                      value={loginEmail}
                      onChange={setLoginEmail}
                      placeholder="you@example.com"
                      required
                    />

                    <InputField
                      label="Password"
                      type={showLoginPw ? "text" : "password"}
                      value={loginPassword}
                      onChange={setLoginPassword}
                      placeholder="••••••••"
                      required
                    >
                      <button
                        type="button"
                        onClick={() => setShowLoginPw(!showLoginPw)}
                        style={{ color: "rgba(148,163,184,0.6)" }}
                        className="hover:text-white transition-colors"
                      >
                        {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </InputField>

                    <div className="pt-1">
                      <SubmitButton loading={loginLoading} label="Sign In" />
                    </div>
                  </form>

                  <div className="text-center text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
                    New to AI Portfolio Maker?{" "}
                    <button
                      onClick={() => setMode("register")}
                      className="font-semibold transition-colors hover:underline"
                      style={{ color: "#a5b4fc" }}
                    >
                      Create an account
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs"
                    style={{ color: "rgba(148,163,184,0.4)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    System online and ready
                  </div>
                </motion.div>
              ) : (
                // Register form shown in left column when panel slides right on mobile
                <motion.div
                  key="register-form-left"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full max-w-sm space-y-5 lg:hidden"
                >
                  <RegisterFormContent
                    regName={regName} setRegName={setRegName}
                    regEmail={regEmail} setRegEmail={setRegEmail}
                    regPassword={regPassword} setRegPassword={setRegPassword}
                    regConfirm={regConfirm} setRegConfirm={setRegConfirm}
                    showRegPw={showRegPw} setShowRegPw={setShowRegPw}
                    agreed={agreed} setAgreed={setAgreed}
                    loading={regLoading} onSubmit={handleRegister}
                    onSwitchToLogin={() => setMode("login")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right column: register form ──────────────────────────────── */}
          <div className="hidden lg:flex items-center justify-center p-8 lg:p-12 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="register-form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full max-w-sm space-y-5"
                >
                  <RegisterFormContent
                    regName={regName} setRegName={setRegName}
                    regEmail={regEmail} setRegEmail={setRegEmail}
                    regPassword={regPassword} setRegPassword={setRegPassword}
                    regConfirm={regConfirm} setRegConfirm={setRegConfirm}
                    showRegPw={showRegPw} setShowRegPw={setShowRegPw}
                    agreed={agreed} setAgreed={setAgreed}
                    loading={regLoading} onSubmit={handleRegister}
                    onSwitchToLogin={() => setMode("login")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Decorative sliding panel (desktop only) ──────────────────── */}
          <motion.div
            variants={panelVariants}
            animate={mode}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="hidden lg:flex absolute top-0 bottom-0 w-1/2 flex-col items-center justify-center p-10 z-20"
            style={{
              background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 35%, #1e3a5f 65%, #0e7490 100%)",
              borderRadius: mode === "login" ? "0 16px 16px 0" : "16px 0 0 16px",
            }}
          >
            {/* Decorative circles inside panel */}
            <div
              className="absolute top-[-60px] right-[-60px] w-48 h-48 rounded-full opacity-20"
              style={{ border: "1px solid rgba(255,255,255,0.4)" }}
            />
            <div
              className="absolute bottom-[-40px] left-[-40px] w-36 h-36 rounded-full opacity-15"
              style={{ border: "1px solid rgba(255,255,255,0.3)" }}
            />
            <div
              className="absolute top-1/2 left-[-20px] w-20 h-20 rounded-full opacity-10"
              style={{ background: "rgba(255,255,255,0.3)" }}
            />

            <div className="relative z-10 text-center space-y-8 w-full">
              {/* Logo */}
              <motion.div
                key={mode + "-panel-logo"}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="flex items-center justify-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-sm leading-tight">AI Portfolio</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Maker</p>
                </div>
              </motion.div>

              {/* Panel headline */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode + "-panel-text"}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <h3 className="text-2xl font-bold text-white leading-tight">
                    {mode === "login"
                      ? "Don't have an account?"
                      : "Already have an account?"}
                  </h3>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {mode === "login"
                      ? "Join thousands of professionals building standout portfolios with AI."
                      : "Sign back in to access your portfolios and credits."}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Feature list — only shown on login panel */}
              <AnimatePresence>
                {mode === "login" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2.5 text-left"
                  >
                    {FEATURES.map((f, i) => (
                      <motion.div
                        key={f.text}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.3 }}
                        className="flex items-center gap-2.5 text-sm"
                        style={{ color: "rgba(255,255,255,0.75)" }}
                      >
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "rgba(255,255,255,0.12)" }}
                        >
                          <f.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        {f.text}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Switch mode button */}
              <motion.button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                }}
              >
                {mode === "login" ? "Create Account" : "Sign In Instead"}
              </motion.button>

              {/* Credit line */}
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                Developed by{" "}
                <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>Manoj</span>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// ── Register form content extracted so it renders in both columns ────────────

interface RegisterFormProps {
  regName: string;       setRegName:     (v: string)  => void;
  regEmail: string;      setRegEmail:    (v: string)  => void;
  regPassword: string;   setRegPassword: (v: string)  => void;
  regConfirm: string;    setRegConfirm:  (v: string)  => void;
  showRegPw: boolean;    setShowRegPw:   (v: boolean) => void;
  agreed: boolean;       setAgreed:      (v: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToLogin: () => void;
}

const RegisterFormContent = ({
  regName, setRegName, regEmail, setRegEmail,
  regPassword, setRegPassword, regConfirm, setRegConfirm,
  showRegPw, setShowRegPw, agreed, setAgreed,
  loading, onSubmit, onSwitchToLogin,
}: RegisterFormProps) => (
  <>
    <div>
      <h2 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>
        Create account
      </h2>
      <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.7)" }}>
        Join AI Portfolio Maker and build your portfolio today
      </p>
    </div>

    <form onSubmit={onSubmit} className="space-y-3.5">
      <InputField label="Full Name" type="text" value={regName} onChange={setRegName}
        placeholder="Your full name" required minLength={2} maxLength={50} />

      <InputField label="Email Address" type="email" value={regEmail} onChange={setRegEmail}
        placeholder="you@example.com" required />

      <InputField
        label="Password"
        type={showRegPw ? "text" : "password"}
        value={regPassword} onChange={setRegPassword}
        placeholder="Min 8 chars, 1 uppercase, 1 number" required minLength={8}
      >
        <button type="button" onClick={() => setShowRegPw(!showRegPw)}
          style={{ color: "rgba(148,163,184,0.6)" }} className="hover:text-white transition-colors">
          {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </InputField>

      <InputField label="Confirm Password" type="password" value={regConfirm}
        onChange={setRegConfirm} placeholder="••••••••" required />

      <label className="flex items-start gap-2.5 text-xs cursor-pointer"
        style={{ color: "rgba(148,163,184,0.65)" }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded"
        />
        <span>
          I agree that my resume content will be processed by Google Gemini AI to generate portfolio
          content, and that I own the rights to the content I upload.
        </span>
      </label>

      <div className="pt-1">
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.015 }}
          whileTap={{ scale: loading ? 1 : 0.985 }}
          className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
            color: "#fff",
            boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Create Account <ArrowRight className="w-4 h-4" /></>
          )}
        </motion.button>
      </div>
    </form>

    <div className="text-center text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
      Already have an account?{" "}
      <button
        onClick={onSwitchToLogin}
        className="font-semibold hover:underline transition-colors lg:hidden"
        style={{ color: "#a5b4fc" }}
      >
        Sign in here
      </button>
    </div>
  </>
);

export default AuthPage;
