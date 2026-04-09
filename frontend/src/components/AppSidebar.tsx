// src/components/AppSidebar.tsx
// Main sidebar navigation for the app.
// All links are functional — no dummy routes.

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutGrid,
  Sparkles,
  History,
  Plus,
  LogOut,
  User,
  Cpu,
} from "lucide-react";

// Only real, functional navigation items
const navItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
  { icon: Sparkles, label: "Generate", path: "/generate" },
  { icon: History, label: "History", path: "/history" },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-[220px] min-h-screen bg-card border-r border-border p-4">
      {/* Brand */}
      <Link to="/dashboard" className="flex items-center gap-2.5 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Cpu className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-foreground">AI PORTFOLIO</p>
          <p className="text-[10px] text-muted-foreground tracking-wider">Maker — v1.0</p>
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

      {/* Bottom section */}
      <div className="mt-auto space-y-1">
        {/* Generate CTA */}
        <button
          onClick={() => navigate("/generate")}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-colors hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          New Portfolio
        </button>

        {/* User info */}
        <div className="mt-3 px-3 py-2 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 mb-0.5">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground truncate">{user?.name}</span>
          </div>
          <p className="text-[10px] text-muted-foreground pl-5">
            {user?.credits ?? 0} credits remaining
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-secondary transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
