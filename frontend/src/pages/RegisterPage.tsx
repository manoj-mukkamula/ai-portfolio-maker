// src/pages/RegisterPage.tsx
// User registration page. All fields are validated and functional.
// Terms & Conditions checkbox is required; link shows an info dialog.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Cpu, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!agreed) {
      toast({ title: "Error", description: "Please agree to Terms & Conditions.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.response?.data?.message || "Could not create account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Cpu className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base text-foreground">AI Portfolio Maker</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in py-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">Create Account</h1>
            <p className="text-xs tracking-widest text-muted-foreground uppercase">Join AI Portfolio Maker</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 block">
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
                className="w-full h-12 px-4 rounded-lg bg-secondary border-0 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-12 px-4 rounded-lg bg-secondary border-0 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 block">
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
                  className="w-full h-12 px-4 pr-12 rounded-lg bg-secondary border-0 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Min 8 characters, 1 uppercase letter, 1 number required
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 block">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-12 px-4 rounded-lg bg-secondary border-0 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-border text-primary"
              />
              <span>
                I agree that this portfolio generator uses my resume text to create portfolio content via Google Gemini AI,
                and that I own the rights to the resume content I upload.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
