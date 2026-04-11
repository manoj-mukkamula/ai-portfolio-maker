// frontend/src/components/AppSidebar.tsx
//
// FIXES:
//   1. Logout now navigates to /login (was calling logout() but not redirecting)
//   2. Shows "Credits reset in Xh Ym" countdown when credits < 5
//   3. Credits pill changes colour: green(5) → amber(≤2) → red(0)

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutGrid, Sparkles, History, Plus, LogOut, User, Cpu, Zap } from "lucide-react";

const navItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
  { icon: Sparkles,   label: "Generate",  path: "/generate"  },
  { icon: History,    label: "History",   path: "/history"   },
];

/** Returns "resets in Xh Ym" string based on creditsLastReset timestamp */
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
  const creditColor =
    credits === 0 ? "text-destructive" :
    credits <= 2  ? "text-warning"     :
    "text-primary";

  // FIX: logout + navigate in one action
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col w-[220px] min-h-screen bg-card border-r border-border p-4">
      {/* Brand */}
      <Link to="/dashboard" className="flex items-center gap-2.5 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Cpu className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-foreground">AI PORTFOLIO MAKER</p>
          <p className="text-[10px] text-muted-foreground tracking-wider">Final Year Project</p>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary"
                  : "text-sidebar-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto space-y-2">
        {/* New Portfolio CTA */}
        <button
          onClick={() => navigate("/generate")}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Portfolio
        </button>

        {/* User info + credits */}
        <div className="px-3 py-2.5 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground truncate">{user?.name}</span>
          </div>
          <div className={`flex items-center gap-1.5 pl-5 text-[11px] font-medium ${creditColor}`}>
            <Zap className="w-3 h-3" />
            {credits} credit{credits !== 1 ? "s" : ""} remaining
          </div>
          {credits < 5 && user?.creditsLastReset && (
            <p className="text-[10px] text-muted-foreground pl-5 mt-0.5">
              {getResetCountdown(user.creditsLastReset)}
            </p>
          )}
        </div>

        {/* Logout — FIX: navigates to /login */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-secondary transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;