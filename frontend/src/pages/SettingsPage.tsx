// src/pages/SettingsPage.tsx
// Removed Security section (was showing password as dots with no functionality)
// Added Export Data section as a meaningful replacement
// Profile, Usage, Appearance, Export Data, Danger Zone

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import {
  User,
  Sun,
  Moon,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
  ChevronRight,
  Check,
  Zap,
  Download,
  FileJson,
  FileText,
} from "lucide-react";

type DeleteStep = "idle" | "feedback" | "confirm";

const FEEDBACK_REASONS = [
  "I got what I needed",
  "The portfolios didn't meet my expectations",
  "I'm switching to a different tool",
  "I have privacy concerns",
  "Just cleaning up old accounts",
  "Other",
];

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [deleteStep, setDeleteStep] = useState<DeleteStep>("idle");
  const [feedbackReason, setFeedbackReason] = useState("");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Enter your password to confirm.",
        variant: "destructive",
      });
      return;
    }
    setDeleting(true);
    try {
      await authApi.deleteAccount({ password });
      logout();
      toast({
        title: "Account deleted",
        description: "Your account and all portfolios have been removed.",
      });
      navigate("/");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Incorrect password or server error.";
      toast({
        title: "Could not delete account",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setDeleteStep("idle");
    setFeedbackReason("");
    setFeedbackNote("");
    setPassword("");
  };

  const handleExportProfile = () => {
    const data = {
      name: user?.name,
      email: user?.email,
      credits: user?.credits,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-portfolio-maker-profile.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Profile exported",
      description: "Your profile data has been downloaded.",
    });
  };

  const credits = user?.credits ?? 0;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs tracking-widest text-primary font-semibold uppercase">
            Account
          </p>
          <h1 className="text-4xl font-extrabold text-foreground mt-1.5 tracking-tight">
            Settings
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your account preferences and data.
          </p>
        </div>

        {/* Profile */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-4 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Profile</h2>
          </div>
          <div className="space-y-1">
            {[
              { label: "Full Name", value: user?.name ?? "—" },
              { label: "Email Address", value: user?.email ?? "—" },
            ].map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between py-4 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="text-base font-semibold text-foreground mt-0.5">
                    {field.value}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground/60 bg-secondary px-2.5 py-1.5 rounded-lg">
                  Read only
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Credits */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-4 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Usage</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-foreground">
                Credits remaining
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Each portfolio generation costs 1 credit
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-foreground">
                {credits}
                <span className="text-lg font-medium text-muted-foreground">
                  {" "}
                  / 5
                </span>
              </p>
              <div className="w-28 h-2 rounded-full bg-border overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(credits / 5) * 100}%`,
                    background:
                      credits === 0
                        ? "#ef4444"
                        : credits <= 2
                          ? "#f59e0b"
                          : "#6366f1",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-4 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-violet-400" />
              ) : (
                <Sun className="w-5 h-5 text-violet-500" />
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-foreground">
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {theme === "dark"
                  ? "Easier on the eyes in low light"
                  : "Better for well-lit environments"}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-border text-base font-medium hover:bg-secondary transition-colors"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" /> Light mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" /> Dark mode
                </>
              )}
            </button>
          </div>
        </section>

        {/* Export Data */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-4 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Export Your Data
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Download a copy of your account information
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleExportProfile}
              className="w-full flex items-center justify-between px-5 py-4 rounded-xl border border-border hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileJson className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="text-base font-semibold text-foreground">
                    Profile data
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Name, email, and credit info as JSON
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </button>
            {/* Replace the static div with: */}
            <button
              onClick={() => navigate("/history")}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer"
            >
              <FileText className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left flex-1">
                <p className="text-base font-semibold text-foreground">
                  Portfolio HTML files
                </p>
                <p className="text-sm text-muted-foreground">
                  Download individual portfolios from History
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>
        </section>

        {/* Danger zone */}
        <section className="bg-card border border-destructive/25 rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Danger Zone</h2>
              <p className="text-sm text-muted-foreground">
                Irreversible actions — proceed carefully
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-5 rounded-xl border border-destructive/20 bg-destructive/5">
            <div>
              <p className="text-base font-semibold text-foreground">
                Delete my account
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Permanently removes your account and all portfolios.
              </p>
            </div>
            <button
              onClick={() => setDeleteStep("feedback")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-destructive/40 text-destructive text-base font-semibold hover:bg-destructive hover:text-white transition-all ml-4 shrink-0"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </section>
      </div>

      {/* Step 1 — Feedback */}
      {deleteStep === "feedback" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-modal w-full max-w-md mx-4 p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-7">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Sorry to see you go
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Help us understand why you're leaving
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-base font-medium text-foreground mb-4">
              Why are you deleting your account?
            </p>
            <div className="space-y-2 mb-5">
              {FEEDBACK_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setFeedbackReason(reason)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-base font-medium text-left transition-all ${
                    feedbackReason === reason
                      ? "border-primary bg-primary/8 text-foreground"
                      : "border-border hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      feedbackReason === reason
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {feedbackReason === reason && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  {reason}
                </button>
              ))}
            </div>
            <textarea
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="Anything else? (optional)"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-3 rounded-xl border border-border text-base font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setDeleteStep("confirm")}
                className="flex-1 py-3 rounded-xl bg-destructive text-white text-base font-semibold hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Password confirmation */}
      {deleteStep === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-modal w-full max-w-sm mx-4 p-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-12 h-12 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Confirm deletion
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter your password to proceed
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="ml-auto p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-base text-muted-foreground mb-6 leading-relaxed">
              This will permanently delete your account and all{" "}
              <span className="font-semibold text-foreground">
                portfolios, settings, and data
              </span>
              .
            </p>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 pr-12 py-3 rounded-xl border border-border bg-background text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-3 rounded-xl border border-border text-base font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !password}
                className="flex-1 py-3 rounded-xl bg-destructive text-white text-base font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default SettingsPage;
