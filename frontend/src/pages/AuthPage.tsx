// src/pages/AuthPage.tsx
//
// Changes in this version:
//  - Mobile card padding improved (p-6 on small screens)
//  - Input spacing: consistent mb-[14px] gap via space-y-[14px]
//  - Heading size reduced slightly on mobile (text-xl sm:text-2xl)
//  - Checkbox label wraps cleanly across 2 lines on mobile
//  - Password placeholder changed from "••••••••" to something readable
//  - Full name placeholder removed (label is enough)
//  - "System online and ready" removed (not meaningful on a login page)
//  - "Developed by Manoj" moved to panel only, removed from login form
//  - "New here?" changed to "New here? Create an account" as a button
//  - "Already have an account?" link text: "Already have an account? Log in here"
//  - "Sign In Instead" on panel kept (clear intent)
//  - No em dashes anywhere
//  - Auth logic, routing, layout structure all unchanged

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Eye, EyeOff, ArrowRight, Loader2,
  Sparkles, Zap, FileText, Download, Star, Shield,
} from "lucide-react";

// ── Input field ──────────────────────────────────────────────────────────────

const InputField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  maxLength,
  children,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  children?: React.ReactNode;
}) => (
  <div>
    <label
      className="block text-[11px] font-semibold tracking-[0.16em] uppercase mb-1.5"
      style={{ color: "rgba(148,163,184,0.75)" }}
    >
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
        className="w-full h-11 rounded-xl text-sm outline-none transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.055)",
          border: "1px solid rgba(255,255,255,0.09)",
          color: "#e2e8f0",
          paddingLeft: "1rem",
          paddingRight: children ? "2.75rem" : "1rem",
        }}
        onFocus={(e) => {
          e.target.style.border = "1px solid rgba(99,102,241,0.7)";
          e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.14), 0 0 12px rgba(99,102,241,0.08)";
          e.target.style.background = "rgba(99,102,241,0.06)";
        }}
        onBlur={(e) => {
          e.target.style.border = "1px solid rgba(255,255,255,0.09)";
          e.target.style.boxShadow = "none";
          e.target.style.background = "rgba(255,255,255,0.055)";
        }}
      />
      {children && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{children}</div>
      )}
    </div>
  </div>
);

// ── Submit button ────────────────────────────────────────────────────────────

const SubmitButton = ({ loading, label }: { loading: boolean; label: string }) => (
  <motion.button
    type="submit"
    disabled={loading}
    whileHover={{ scale: loading ? 1 : 1.015 }}
    whileTap={{ scale: loading ? 1 : 0.98 }}
    className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
    style={{
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #06b6d4 100%)",
      color: "#fff",
      boxShadow: "0 4px 20px rgba(99,102,241,0.38)",
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

// ── Feature list ─────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Sparkles, text: "AI-powered resume parsing" },
  { icon: FileText, text: "6 professional templates" },
  { icon: Zap,      text: "Generate in under 60 seconds" },
  { icon: Download, text: "Download as standalone HTML" },
  { icon: Star,     text: "5 free credits per session" },
  { icon: Shield,   text: "Your data stays private" },
];

// ── Register form ─────────────────────────────────────────────────────────────

interface RegProps {
  regName: string;     setRegName:     (v: string)  => void;
  regEmail: string;    setRegEmail:    (v: string)  => void;
  regPassword: string; setRegPassword: (v: string)  => void;
  regConfirm: string;  setRegConfirm:  (v: string)  => void;
  showRegPw: boolean;  setShowRegPw:   (v: boolean) => void;
  agreed: boolean;     setAgreed:      (v: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToLogin: () => void;
}

const RegisterForm = ({
  regName, setRegName, regEmail, setRegEmail,
  regPassword, setRegPassword, regConfirm, setRegConfirm,
  showRegPw, setShowRegPw, agreed, setAgreed,
  loading, onSubmit, onSwitchToLogin,
}: RegProps) => (
  <>
    <div>
      <h2
        className="text-xl sm:text-2xl font-bold"
        style={{ color: "#f1f5f9" }}
      >
        Create your account
      </h2>
      <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.65)" }}>
        Join AI Portfolio Maker and build your portfolio today
      </p>
    </div>

    <form onSubmit={onSubmit} className="space-y-[14px]">
      <InputField
        label="Full Name"
        type="text"
        value={regName}
        onChange={setRegName}
        required
        minLength={2}
        maxLength={50}
      />

      <InputField
        label="Email Address"
        type="email"
        value={regEmail}
        onChange={setRegEmail}
        placeholder="you@example.com"
        required
      />

      <InputField
        label="Password"
        type={showRegPw ? "text" : "password"}
        value={regPassword}
        onChange={setRegPassword}
        placeholder="Min 8 chars, 1 uppercase, 1 number"
        required
        minLength={8}
      >
        <button
          type="button"
          onClick={() => setShowRegPw(!showRegPw)}
          style={{ color: "rgba(148,163,184,0.55)" }}
          className="hover:text-white transition-colors"
        >
          {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </InputField>

      <InputField
        label="Confirm Password"
        type="password"
        value={regConfirm}
        onChange={setRegConfirm}
        placeholder="Repeat your password"
        required
      />

      {/* Checkbox — wraps cleanly on mobile */}
      <label
        className="flex items-start gap-2.5 cursor-pointer select-none"
        style={{ color: "rgba(148,163,184,0.65)" }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded shrink-0 accent-indigo-500"
        />
        <span className="text-xs leading-relaxed">
          I agree that my resume will be processed by Google Gemini AI to generate portfolio
          content, and that I own the rights to the content I upload.
        </span>
      </label>

      <div className="pt-1">
        <SubmitButton loading={loading} label="Create Account" />
      </div>
    </form>

    {/* Mobile only switch link */}
    <p className="text-center text-sm lg:hidden" style={{ color: "rgba(148,163,184,0.6)" }}>
      Already have an account?{" "}
      <button
        onClick={onSwitchToLogin}
        className="font-semibold hover:underline transition-colors"
        style={{ color: "#a5b4fc" }}
      >
        Log in here
      </button>
    </p>
  </>
);

// ── Main auth page ────────────────────────────────────────────────────────────

type Mode = "login" | "register";

const AuthPage = () => {
  const [mode, setMode] = useState<Mode>("login");

  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw]     = useState(false);
  const [loginLoading, setLoginLoading]   = useState(false);

  const [regName, setRegName]         = useState("");
  const [regEmail, setRegEmail]       = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm]   = useState("");
  const [showRegPw, setShowRegPw]     = useState(false);
  const [agreed, setAgreed]           = useState(false);
  const [regLoading, setRegLoading]   = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Auth handlers (untouched) ────────────────────────────────────────────

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
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same.", variant: "destructive" });
      return;
    }
    if (!agreed) {
      toast({ title: "One more thing", description: "Please check the agreement box before continuing.", variant: "destructive" });
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
    } finally {
      setRegLoading(false);
    }
  };

  const switchToRegister = () => setMode("register");
  const switchToLogin    = () => setMode("login");

  const formIn  = { opacity: 0, x: 20 };
  const formOut = { opacity: 0, x: -20 };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #080c18 0%, #0e1525 60%, #0a1020 100%)",
        scrollBehavior: "smooth",
      }}
    >
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)" }}
        />
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
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{
          background: "rgba(12,17,30,0.94)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)",
          backdropFilter: "blur(24px)",
          minHeight: 560,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[560px]">

          {/* Left column — Login form (desktop) / active form (mobile) */}
          <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 order-2 lg:order-1">
            <AnimatePresence mode="wait">

              {mode === "login" ? (
                <motion.div
                  key="login"
                  initial={formIn}
                  animate={{ opacity: 1, x: 0 }}
                  exit={formOut}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="w-full max-w-sm"
                >
                  {/* Heading */}
                  <div className="mb-6">
                    <h2
                      className="text-xl sm:text-2xl font-bold"
                      style={{ color: "#f1f5f9" }}
                    >
                      Welcome back
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.65)" }}>
                      Sign in to your account to continue
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-[14px]">
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
                      placeholder="Your password"
                      required
                    >
                      <button
                        type="button"
                        onClick={() => setShowLoginPw(!showLoginPw)}
                        style={{ color: "rgba(148,163,184,0.55)" }}
                        className="hover:text-white transition-colors"
                      >
                        {showLoginPw
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />}
                      </button>
                    </InputField>
                    <div className="pt-1">
                      <SubmitButton loading={loginLoading} label="Log In" />
                    </div>
                  </form>

                  {/* Mobile switch */}
                  <p
                    className="text-center text-sm mt-5 lg:hidden"
                    style={{ color: "rgba(148,163,184,0.6)" }}
                  >
                    New here?{" "}
                    <button
                      onClick={switchToRegister}
                      className="font-semibold hover:underline transition-colors"
                      style={{ color: "#a5b4fc" }}
                    >
                      Create an account
                    </button>
                  </p>
                </motion.div>

              ) : (
                /* Mobile register form */
                <motion.div
                  key="register-mobile"
                  initial={formIn}
                  animate={{ opacity: 1, x: 0 }}
                  exit={formOut}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="w-full max-w-sm space-y-[14px] lg:hidden"
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

          {/* Right column — Register form (desktop only) */}
          <div className="hidden lg:flex items-center justify-center p-8 lg:p-12 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="register-desktop"
                  initial={formIn}
                  animate={{ opacity: 1, x: 0 }}
                  exit={formOut}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="w-full max-w-sm space-y-[14px]"
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

        {/* ── Decorative sliding panel (desktop only) ──────────────────────
            mode=login    -> panel on RIGHT (left: "50%"), shows sign-up prompt
            mode=register -> panel on LEFT  (left: "0%"),  shows log-in prompt
        ─────────────────────────────────────────────────────────────────── */}
        <motion.div
          animate={{ left: mode === "login" ? "50%" : "0%" }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
          className="hidden lg:flex absolute top-0 bottom-0 w-1/2 flex-col items-center justify-center p-10 z-20"
          style={{
            background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 35%, #1e3a5f 65%, #0e7490 100%)",
            borderRadius: mode === "login" ? "0 16px 16px 0" : "16px 0 0 16px",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute top-[-60px] right-[-60px] w-48 h-48 rounded-full opacity-20"
            style={{ border: "1px solid rgba(255,255,255,0.4)" }}
          />
          <div
            className="absolute bottom-[-40px] left-[-40px] w-36 h-36 rounded-full opacity-15"
            style={{ border: "1px solid rgba(255,255,255,0.3)" }}
          />

          <div className="relative z-10 text-center space-y-7 w-full">

            {/* Logo — single line */}
            <motion.div
              key={mode + "-logo"}
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className="flex items-center justify-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-base leading-tight whitespace-nowrap">
                AI Portfolio Maker
              </span>
            </motion.div>

            {/* Panel headline */}
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
                  {mode === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </h3>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {mode === "login"
                    ? "Join thousands of professionals building standout portfolios with AI."
                    : "Log back in to access your portfolios and credits."}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Feature list — login panel only */}
            <AnimatePresence>
              {mode === "login" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-2.5 text-left"
                >
                  {FEATURES.map((f, i) => (
                    <motion.div
                      key={f.text}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.25 }}
                      className="flex items-center gap-2.5 text-sm"
                      style={{ color: "rgba(255,255,255,0.8)" }}
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

            {/* CTA button */}
            <motion.button
              onClick={mode === "login" ? switchToRegister : switchToLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                color: "#fff",
                backdropFilter: "blur(8px)",
              }}
            >
              {mode === "login" ? "Create Account" : "Log In Instead"}
            </motion.button>

            {/* Developed by — kept in panel, removed from form */}
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              Developed by{" "}
              <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>Manoj</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthPage;