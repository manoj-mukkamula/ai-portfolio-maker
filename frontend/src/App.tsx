// src/App.tsx
//
// CHANGES:
//   1. SplashScreen added — shown once per browser session (sessionStorage guard).
//      It renders outside BrowserRouter so it covers the entire viewport cleanly.
//   2. /login and /register both point to AuthPage (the combined animated auth page).
//      The old LoginPage and RegisterPage imports are removed.
//   3. All other routes, guards, providers, and auth logic are untouched.

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "@/components/SplashScreen";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import GeneratePage from "./pages/GeneratePage";
import HistoryPage from "./pages/HistoryPage";
import PreviewPage from "./pages/PreviewPage";
import EditorPage from "./pages/EditorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Show the splash only once per browser session, not on every navigation
const hasSeenSplash = sessionStorage.getItem("splash_shown") === "true";

const App = () => {
  const [splashDone, setSplashDone] = useState(hasSeenSplash);

  const handleSplashComplete = () => {
    sessionStorage.setItem("splash_shown", "true");
    setSplashDone(true);
  };

  return (
    <>
      {/* Splash screen sits outside the router so it overlays everything */}
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}

      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Both /login and /register use the combined AuthPage */}
                <Route path="/login"    element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />

                <Route
                  path="/dashboard"
                  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
                />
                <Route
                  path="/generate"
                  element={<ProtectedRoute><GeneratePage /></ProtectedRoute>}
                />
                <Route
                  path="/history"
                  element={<ProtectedRoute><HistoryPage /></ProtectedRoute>}
                />
                <Route
                  path="/preview/:id"
                  element={<ProtectedRoute><PreviewPage /></ProtectedRoute>}
                />
                <Route
                  path="/editor/:id"
                  element={<ProtectedRoute><EditorPage /></ProtectedRoute>}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
