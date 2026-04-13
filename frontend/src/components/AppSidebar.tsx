// src/components/AppSidebar.tsx
// Updates:
//  - Collapse/expand toggle with smooth animation
//  - Dark mode toggle always visible (icon when collapsed, icon+label when expanded)
//  - Collapsed state shows icon-only nav
//  - Persists collapsed state to localStorage

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LayoutGrid, Sparkles, History, Plus, LogOut,
  Zap, Sun, Moon, BrainCircuit, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
  { icon: Sparkles,   label: "Generate",  path: "/generate"  },
  { icon: History,    label: "History",   path: "/history"   },
];

function getResetCountdown(creditsLastReset?: string): string {
  if (!creditsLastReset) return "";
  const resetAt = new Date(creditsLastReset).getTime() + 24 * 60 * 60 * 1000;
  const diff = resetAt - Date.now();
  if (diff <= 0) return "resets soon";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `resets in ${h}h ${m}m`;
  return `resets in ${m}m`;
}

const AppSidebar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", String(collapsed));
  }, [collapsed]);

  const credits = user?.credits ?? 0;
  const creditBarColor =
    credits === 0 ? "#ef4444" : credits <= 2 ? "#f59e0b" : "#6366f1";
  const creditTextColor =
    credits === 0 ? "text-destructive" : credits <= 2 ? "text-amber-500" : "text-primary";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className="hidden lg:flex flex-col min-h-screen bg-card border-r border-border transition-all duration-300 ease-in-out relative"
      style={{ width: collapsed ? "68px" : "230px" }}
    >
      {/* Collapse toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-secondary transition-colors"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-muted-foreground" />
          : <ChevronLeft  className="w-3 h-3 text-muted-foreground" />}
      </button>

      <div className="flex flex-col flex-1 p-3 gap-1 overflow-hidden">
        {/* Brand */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 mb-7 px-1.5 py-1 overflow-hidden"
          title="AI Portfolio Maker"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-foreground whitespace-nowrap leading-tight">
                AI Portfolio Maker
              </p>
              <p className="text-[10px] text-muted-foreground tracking-wide">Final Year Project</p>
            </div>
          )}
        </Link>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                style={isActive ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" } : {}}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto space-y-2">
          {/* New Portfolio button */}
          <button
            onClick={() => navigate("/generate")}
            title={collapsed ? "New Portfolio" : undefined}
            className={`flex items-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] ${
              collapsed ? "justify-center px-2" : "justify-center"
            }`}
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!collapsed && "New Portfolio"}
          </button>

          {/* Credits card — only when expanded */}
          {!collapsed && (
            <div className="px-3 py-3 rounded-xl bg-secondary/60 border border-border">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Credits</span>
                </div>
                <span className={`text-xs font-bold ${creditTextColor}`}>{credits} / 5</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(credits / 5) * 100}%`, background: creditBarColor }}
                />
              </div>
              {credits < 5 && user?.creditsLastReset && (
                <p className="text-[10px] text-muted-foreground">{getResetCountdown(user.creditsLastReset)}</p>
              )}
            </div>
          )}

          {/* Credits icon when collapsed */}
          {collapsed && (
            <div
              title={`${credits}/5 credits`}
              className="flex items-center justify-center w-full py-2 rounded-xl bg-secondary/60 border border-border cursor-default"
            >
              <Zap className={`w-4 h-4 ${creditTextColor}`} />
            </div>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors w-full ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                {!collapsed && "Light mode"}
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 shrink-0" />
                {!collapsed && "Dark mode"}
              </>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={collapsed ? "Log out" : undefined}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 transition-colors w-full ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && "Log out"}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
