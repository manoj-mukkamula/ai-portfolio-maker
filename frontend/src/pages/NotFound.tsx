// src/pages/NotFound.tsx
// Branded 404 page with AI Portfolio Maker identity

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    console.error("404: No route found for", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #080c18 0%, #0e1525 60%, #0a1020 100%)" }}
    >
      {/* Background orb */}
      <div
        className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 text-center max-w-sm mx-auto">
        <div
          className="text-8xl font-extrabold mb-4 leading-none"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-sm mb-8" style={{ color: "rgba(148,163,184,0.7)" }}>
          This page doesn't exist. It may have been moved or the URL is incorrect.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e2e8f0",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>

        <p className="text-xs mt-10" style={{ color: "rgba(148,163,184,0.3)" }}>
          AI Portfolio Maker
        </p>
      </div>
    </div>
  );
};

export default NotFound;
