// src/pages/SettingsPage.tsx
// Settings page with full account deletion flow:
//  Step 1: "Sorry to see you go" + feedback
//  Step 2: Password confirmation
//  Step 3: Delete + logout + redirect

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import {
  User, Shield, Sun, Moon, Trash2, AlertTriangle, Eye, EyeOff,
  ChevronRight, X,
} from "lucide-react";

type DeleteStep = "idle" | "feedback" | "confirm";

const FEEDBACK_REASONS = [
  "I got what I needed",
  "The portfolios didn't meet my expectations",
  "I'm using a different tool",
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
      toast({ title: "Password required", description: "Enter your password to confirm.", variant: "destructive" });
      return;
    }
    setDeleting(true);
    try {
      // Call delete account endpoint
      await authApi.deleteAccount({ password });
      logout();
      toast({ title: "Account deleted", description: "Your account and all portfolios have been removed." });
      navigate("/");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Incorrect password or server error.";
      toast({ title: "Could not delete account", description: msg, variant: "destructive" });
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

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-7">
          <p className="text-[11px] tracking-widest text-primary font-semibold uppercase">Account</p>
          <h1 className="text-2xl font-bold text-foreground mt-1">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account preferences and security.</p>
        </div>

        {/* Profile section */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <User className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-foreground text-sm">Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="font-semibold text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <Sun className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-foreground text-sm">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Color theme</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Currently using {theme === "dark" ? "dark" : "light"} mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors"
            >
              {theme === "dark"
                ? <><Sun className="w-4 h-4 text-amber-400" /> Light mode</>
                : <><Moon className="w-4 h-4" /> Dark mode</>}
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-foreground text-sm">Security</h2>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Password</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your password is stored securely using bcrypt</p>
            </div>
            <button className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline transition-colors">
              Change <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-card border border-destructive/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h2 className="font-bold text-destructive text-sm">Danger zone</h2>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
                Permanently delete your account and all associated portfolios. This action cannot be reversed.
              </p>
            </div>
            <button
              onClick={() => setDeleteStep("feedback")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteStep !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-modal w-full max-w-md mx-4 overflow-hidden animate-fade-in">
            {/* Step 1: Feedback */}
            {deleteStep === "feedback" && (
              <div className="p-7">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-foreground text-base">Sorry to see you go</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Your feedback helps us improve</p>
                  </div>
                  <button onClick={handleCloseModal} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Before you go, could you tell us why you're leaving? It takes just a second.
                </p>

                <div className="space-y-2 mb-4">
                  {FEEDBACK_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setFeedbackReason(reason)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        feedbackReason === reason
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-foreground hover:bg-secondary"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <textarea
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="Anything else you'd like to share? (optional)"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary outline-none resize-none transition-all mb-5"
                />

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    Actually, keep my account
                  </button>
                  <button
                    onClick={() => setDeleteStep("confirm")}
                    className="flex-1 h-10 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Password confirm */}
            {deleteStep === "confirm" && (
              <div className="p-7">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-foreground text-base">Confirm deletion</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">This cannot be undone</p>
                  </div>
                  <button onClick={handleCloseModal} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-5">
                  <p className="text-sm text-destructive font-medium">
                    This will permanently delete your account, all {user?.name && <strong>{user.name}'s</strong>} portfolios, and all associated data.
                  </p>
                </div>

                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Enter your password to confirm
                </label>
                <div className="relative mb-5">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your current password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-destructive focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDeleteStep("feedback")}
                    className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || !password.trim()}
                    className="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? "Deleting..." : "Delete my account"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default SettingsPage;
