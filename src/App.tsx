import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts";
import { ProtectedRoute } from "@/components";
import { supabase } from "@/integrations/supabase/client";
import {
  Index,
  Login,
  Signup,
  ForgotPassword,
  ResetPassword,
  Dashboard,
  ProfileSettings,
  NotFound,
  TermsOfService,
  PrivacyPolicy,
} from "@/pages";

const queryClient = new QueryClient();
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
const N8N_HEALTHCHECK_URL = import.meta.env.VITE_N8N_HEALTHCHECK_URL as string | undefined;

const resolveN8nProbeUrl = (): string | null => {
  if (N8N_HEALTHCHECK_URL) return N8N_HEALTHCHECK_URL;
  if (!N8N_WEBHOOK_URL) return null;

  try {
    const parsed = new URL(N8N_WEBHOOK_URL);
    return `${parsed.origin}/`;
  } catch {
    return null;
  }
};

const App = () => {
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      const { count, error } = await supabase
        .from("telemetry_data")
        .select("id", { head: true, count: "exact" });

      if (error) {
        console.error("[SUPABASE] Connection failed:", error.message);
        return;
      }

      console.info(`[SUPABASE] Connected. telemetry_data rows visible: ${count ?? 0}`);
    };

    const checkN8nStatus = async () => {
      const probeUrl = resolveN8nProbeUrl();
      if (!probeUrl) {
        console.warn("[N8N] Skipped status check: set VITE_N8N_WEBHOOK_URL or VITE_N8N_HEALTHCHECK_URL in .env");
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      try {
        const response = await fetch("/__n8n_health", {
          method: "GET",
          signal: controller.signal,
        });

        if (response.ok) {
          console.info(`[N8N] Active via local proxy. Health check status: ${response.status}`);
          return;
        }

        console.warn(`[N8N] Proxy reachable but health check returned status: ${response.status}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[N8N] Connection failed via proxy:", message);
      } finally {
        clearTimeout(timeout);
      }
    };

    void checkSupabaseConnection();
    void checkN8nStatus();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
