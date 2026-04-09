import { useAuth } from "@/contexts/AuthContext";
import { Bell, Zap, Menu, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 bg-card/95 backdrop-blur-sm p-6 flex flex-col lg:hidden" onClick={onClose}>
      <div className="flex flex-col gap-4 mt-12" onClick={(e) => e.stopPropagation()}>
        <Link to="/dashboard" className="text-lg font-medium py-2" onClick={onClose}>Gallery</Link>
        <Link to="/generate" className="text-lg font-medium py-2" onClick={onClose}>Generate</Link>
        <Link to="/history" className="text-lg font-medium py-2" onClick={onClose}>History</Link>
        <button onClick={() => { logout(); onClose(); navigate("/login"); }} className="text-lg font-medium py-2 text-destructive flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-4 lg:px-8 py-3 border-b border-border bg-card">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="hidden md:block flex-1 max-w-xs">
            <Input placeholder="Search projects..." className="h-9 text-sm bg-secondary border-0" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-sm font-medium">
              <Zap className="w-3.5 h-3.5 text-primary" />
              {user?.credits ?? 0} Credits
            </div>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
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
