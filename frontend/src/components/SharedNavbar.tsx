// src/components/SharedNavbar.tsx
// Universal navbar — public pages: full nav + CTA | auth pages: brand + back home

import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { BrainCircuit, Sun, Moon } from "lucide-react";

type NavbarVariant = "public" | "auth";

interface SharedNavbarProps {
  variant?: NavbarVariant;
}

const SharedNavbar = ({ variant = "public" }: SharedNavbarProps) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { label: "Features",     href: "/#features"     },
    { label: "How it works", href: "/#how-it-works" },
    { label: "About",        href: "/about"         },
    { label: "Contact",      href: "/contact"       },
  ];

  const isActive = (href: string) =>
    !href.startsWith("/#") && location.pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Brand — always links to home */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-foreground text-base tracking-tight hidden sm:block whitespace-nowrap">
            AI Portfolio Maker
          </span>
        </Link>

        {/* Center nav — public only */}
        {variant === "public" && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>

          {variant === "public" && (
            <>
              <Link
                to="/login"
                className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] shadow-sm whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Get started
              </Link>
            </>
          )}

          {variant === "auth" && (
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary"
            >
              Back to home
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default SharedNavbar;
