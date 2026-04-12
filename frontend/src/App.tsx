// src/App.tsx
// Added ThemeProvider wrapping everything so dark mode works across all pages.
// Auth pages excluded from dark mode (they have their own fixed dark background).

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
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

const hasSeenSplash = sessionStorage.getItem("splash_shown") === "true";

const App = () => {
  const [splashDone, setSplashDone] = useState(hasSeenSplash);

  const handleSplashComplete = () => {
    sessionStorage.setItem("splash_shown", "true");
    setSplashDone(true);
  };

  return (
    <ThemeProvider>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}

      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login"    element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/generate"  element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
                <Route path="/history"   element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/preview/:id" element={<ProtectedRoute><PreviewPage /></ProtectedRoute>} />
                <Route path="/editor/:id"  element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;