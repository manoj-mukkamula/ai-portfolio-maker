// src/components/AppLayout.tsx
// Fix: "Account info" button in profile dropdown now navigates to /settings (was a dummy no-op)

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Zap, Menu, LogOut, Settings, Sun, Moon,
  ChevronDown, X, BrainCircuit,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 z-50 bg-card/98 backdrop-blur-sm flex flex-col lg:hidden animate-fade-in">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-foreground text-sm">AI Portfolio Maker</span>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Generate",  path: "/generate"  },
          { label: "History",   path: "/history"   },
          { label: "Settings",  path: "/settings"  },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className="px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-secondary transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-secondary transition-colors w-full"
        >
          {theme === "dark"
            ? <><Sun className="w-4 h-4 text-amber-400" /> Light mode</>
            : <><Moon className="w-4 h-4" /> Dark mode</>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </div>
    </div>
  );
};

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const credits = user?.credits ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-secondary transition-colors"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          {user?.name?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-card shadow-modal z-50 overflow-hidden animate-fade-in">
          {/* User info */}
          <div className="px-4 py-3.5 border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
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

          {/* Credits */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-medium">Credits remaining</span>
              <span
                className={`text-xs font-bold ${
                  credits === 0 ? "text-destructive" : credits <= 2 ? "text-amber-500" : "text-emerald-500"
                }`}
              >
                {credits} / 5
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(credits / 5) * 100}%`,
                  background:
                    credits === 0
                      ? "#ef4444"
                      : credits <= 2
                      ? "#f59e0b"
                      : "linear-gradient(90deg, #6366f1, #22c55e)",
                }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Resets every 24 hours</p>
          </div>

          {/* Actions */}
          <div className="p-2">
            {/* Settings — actually navigates now */}
            <button
              onClick={() => { setOpen(false); navigate("/settings"); }}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              Account settings
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const credits = user?.credits ?? 0;
  const creditPillClass =
    credits === 0
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : credits <= 2
      ? "border-amber-400/30 bg-amber-400/10 text-amber-500"
      : "border-border bg-card text-foreground";

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-border bg-card sticky top-0 z-40">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          <span className="lg:hidden text-sm font-bold text-foreground">AI Portfolio Maker</span>

          <div className="flex items-center gap-2 ml-auto">
            {/* Credits pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium cursor-default ${creditPillClass}`}
              title={`${credits} of 5 daily credits remaining`}
            >
              <Zap className="w-3.5 h-3.5" />
              {credits} Credit{credits !== 1 ? "s" : ""}
            </div>

            {/* Dark mode toggle — always visible in ALL navbars */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-lg hover:bg-secondary transition-colors border border-transparent hover:border-border"
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>

            <ProfileDropdown />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </div>
  );
};

export default AppLayout;
