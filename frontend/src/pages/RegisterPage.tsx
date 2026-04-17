// src/pages/RegisterPage.tsx
// Auth header is fully custom — no SharedNavbar to avoid any theme toggle bleed-through
// Clean, premium sign-up page with proper light/dark support

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BrainCircuit, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RegisterPage = () => {
  const [name, setName]                       = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [agreed, setAgreed]                   = useState(false);
  const [loading, setLoading]                 = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();
  const { toast }    = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are identical.", variant: "destructive" });
      return;
    }
    if (!agreed) {
      toast({ title: "Agreement required", description: "Please accept the terms before continuing.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.response?.data?.message || "Could not create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-12 px-4 rounded-xl bg-secondary border border-transparent text-foreground text-base placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 outline-none transition-all";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal auth header — brand only, no controls */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-foreground text-base tracking-tight hidden sm:block">
              AI Portfolio Maker
            </span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary"
          >
            Back to home
          </Link>
        </div>
      </header>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full opacity-[0.045]"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }}
        />
        <div
          className="absolute bottom-1/3 left-1/5 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md animate-fade-in py-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create your account</h1>
            <p className="text-base text-muted-foreground mt-2">Start with 5 free portfolio generations</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  minLength={2}
                  maxLength={50}
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Minimum 8 characters with at least one uppercase letter and one number
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 text-sm text-muted-foreground cursor-pointer">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary accent-primary"
                />
              </div>
              <span className="leading-relaxed">
                I understand that this tool uses my resume content to generate a portfolio via Google Gemini AI, and I own the rights to everything I upload.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in here
            </Link>
          </p>

          {/* Trust signal */}
          <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-muted-foreground/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Your data is never sold or shared with third parties</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
