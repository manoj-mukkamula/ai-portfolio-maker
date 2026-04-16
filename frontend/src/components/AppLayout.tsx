// src/components/AppLayout.tsx
// Stable layout wrapper for all authenticated pages.
// Profile dropdown: "Account settings" renamed to "Preferences"

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Zap, Menu, LogOut, Settings, Sun, Moon,
  ChevronDown, X, BrainCircuit, Plus,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";

// ─── Mobile full-screen menu ──────────────────────────────────────────────────
const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleNav = (path: string) => { onClose(); navigate(path); };
  const handleLogout = () => { logout(); onClose(); navigate("/login"); };

  return (
    <div className="fixed inset-0 z-50 bg-card flex flex-col lg:hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-foreground text-base">AI Portfolio Maker</span>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Generate",  path: "/generate"  },
          { label: "History",   path: "/history"   },
          { label: "Settings",  path: "/settings"  },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => handleNav(item.path)}
            className="text-left px-4 py-3.5 rounded-xl text-base font-medium text-foreground hover:bg-secondary transition-colors"
          >
            {item.label}
          </button>
        ))}

        <button
          onClick={() => handleNav("/generate")}
          className="mt-3 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          <Plus className="w-5 h-5" /> New Portfolio
        </button>
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-secondary transition-colors w-full"
        >
          {theme === "dark"
            ? <><Sun className="w-5 h-5 text-amber-400" /> Switch to light mode</>
            : <><Moon className="w-5 h-5" /> Switch to dark mode</>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" /> Log out
        </button>
      </div>
    </div>
  );
};

// ─── Profile dropdown ─────────────────────────────────────────────────────────
const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const close = (fn?: () => void) => { setOpen(false); fn?.(); };
  const credits = user?.credits ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-secondary transition-colors"
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          {user?.name?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">
          {user?.name ?? "Account"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-card shadow-modal z-50 overflow-hidden animate-scale-in">
          {/* User info */}
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Credits bar */}
          <div className="px-5 py-3.5 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">Credits remaining</span>
              <span className={`text-sm font-bold ${
                credits === 0 ? "text-destructive" : credits <= 2 ? "text-amber-500" : "text-emerald-500"
              }`}>
                {credits} / 5
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(credits / 5) * 100}%`,
                  background: credits === 0 ? "#ef4444" : credits <= 2 ? "#f59e0b" : "linear-gradient(90deg, #6366f1, #22c55e)",
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Each generation uses 1 credit</p>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => close(() => navigate("/settings"))}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" /> Preferences
            </button>
            <button
              onClick={() => close(() => { logout(); navigate("/login"); })}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── AppLayout ────────────────────────────────────────────────────────────────
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const credits = user?.credits ?? 0;
  const creditColor =
    credits === 0 ? "border-destructive/30 bg-destructive/8 text-destructive"
    : credits <= 2 ? "border-amber-400/30 bg-amber-400/8 text-amber-600 dark:text-amber-400"
    : "border-border bg-secondary/60 text-foreground";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="flex items-center justify-between px-4 lg:px-6 h-16 border-b border-border bg-card sticky top-0 z-40 shrink-0">
          {/* Mobile: hamburger + brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground">AI Portfolio Maker</span>
            </Link>
          </div>

          {/* Desktop: spacer */}
          <div className="hidden lg:block flex-1" />

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Credits pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm font-semibold ${creditColor}`}
              title={`${credits} of 5 daily credits remaining`}
            >
              <Zap className="w-3.5 h-3.5" />
              {credits} / 5
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>

            <ProfileDropdown />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-8 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </div>
  );
};

export default AppLayout;
