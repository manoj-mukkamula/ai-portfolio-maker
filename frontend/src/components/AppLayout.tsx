// frontend/src/components/AppLayout.tsx
//
// FIXES:
//   1. Removed non-functional Bell notification icon — replaced with
//      a "credits reset countdown" tooltip on the credits pill
//   2. Mobile logout now navigates to /login
//   3. Credits pill colour-coded: green(5) → amber(≤2) → red(0)

import { useAuth } from "@/contexts/AuthContext";
import { Zap, Menu, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // FIX: logout + navigate
  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-card/95 backdrop-blur-sm p-6 flex flex-col lg:hidden"
      onClick={onClose}
    >
      <div className="flex flex-col gap-4 mt-12" onClick={(e) => e.stopPropagation()}>
        <Link to="/dashboard" className="text-lg font-medium py-2" onClick={onClose}>Dashboard</Link>
        <Link to="/generate"  className="text-lg font-medium py-2" onClick={onClose}>Generate</Link>
        <Link to="/history"   className="text-lg font-medium py-2" onClick={onClose}>History</Link>
        <button
          onClick={handleLogout}
          className="text-lg font-medium py-2 text-destructive flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const credits = user?.credits ?? 0;
  const creditPillClass =
    credits === 0
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : credits <= 2
      ? "border-warning/40 bg-warning/10 text-warning"
      : "border-border bg-card text-foreground";

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-4 lg:px-8 py-3 border-b border-border bg-card sticky top-0 z-40">
          {/* Mobile hamburger */}
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-xs">
            <Input
              placeholder="Search projects..."
              className="h-9 text-sm bg-secondary border-0"
              readOnly
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Credits pill — FIX: replaced broken Bell with meaningful info */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium cursor-default ${creditPillClass}`}
              title={
                credits === 0
                  ? "No credits left — resets every 24 hours"
                  : `${credits} of 5 daily credits remaining`
              }
            >
              <Zap className="w-3.5 h-3.5" />
              {credits} Credit{credits !== 1 ? "s" : ""}
            </div>

            {/* User avatar */}
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold select-none">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
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