// src/components/AppSidebar.tsx
// Dark mode toggle removed from sidebar — it now lives in the navbar.
// Sidebar is kept clean: nav links, New Portfolio button, credits, logout.

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutGrid, Sparkles, History, Plus, LogOut, Zap, BrainCircuit } from "lucide-react";

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
  const location = useLocation();
  const navigate  = useNavigate();
  const { logout, user } = useAuth();

  const credits = user?.credits ?? 0;
  const creditBarColor = credits === 0 ? "#ef4444" : credits <= 2 ? "#f59e0b" : "#6366f1";
  const creditTextColor = credits === 0 ? "text-destructive" : credits <= 2 ? "text-amber-500" : "text-primary";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col w-[230px] min-h-screen bg-card border-r border-border p-4 gap-1">
      {/* Brand */}
      <Link to="/dashboard" className="flex items-center gap-2.5 mb-7 px-2 py-1">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          <BrainCircuit className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground whitespace-nowrap leading-tight">
            AI Portfolio Maker
          </p>
          <p className="text-[10px] text-muted-foreground tracking-wide">Final Year Project</p>
        </div>
      </Link>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
              style={isActive ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" } : {}}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-3">
        <button
          onClick={() => navigate("/generate")}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          <Plus className="w-4 h-4" />
          New Portfolio
        </button>

        {/* Credits */}
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

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" /> Log out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;