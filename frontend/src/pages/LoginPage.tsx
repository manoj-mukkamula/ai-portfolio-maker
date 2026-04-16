// src/pages/LoginPage.tsx
// Removed theme-toggle icon from auth navbar for login page
// Added proper light/dark styling for background blobs

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BrainCircuit, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const { toast }  = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.response?.data?.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal brand-only header — no theme toggle on auth pages */}
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
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07), transparent)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.05), transparent)" }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          {/* Title */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-base mt-2">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-5">
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
                  className="w-full h-12 px-4 rounded-xl bg-secondary border border-transparent text-foreground text-base placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 outline-none transition-all"
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
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-secondary border border-transparent text-foreground text-base placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Sign up for free
            </Link>
          </p>

          {/* Status indicator */}
          <div className="text-center mt-4">
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              System ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
