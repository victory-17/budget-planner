import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/lib/providers/auth-provider";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { Layout } from "@/components/layout/layout";
import { ProtectedRoute } from "@/lib/utils/protected-route";
import { useAuth } from "@/lib/providers/auth-provider";

// Auth Pages
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import AuthCallback from "./pages/auth/callback";
import DiagnoseAuth from "./pages/auth/DiagnoseAuth";

// Main Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Budgets from "./pages/budgets/Budgets";
import Transactions from "./pages/transactions/Transactions";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";
import Help from "./pages/help/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirect component based on authentication status
const AuthRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking auth
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-budget-green"></div>
    </div>
  );
  
  // Redirect based on auth status
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/signin" replace />;
};

// Public route component to redirect authenticated users away from auth pages
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-budget-green"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Redirect root to dashboard if authenticated, otherwise to signin */}
              <Route path="/" element={<AuthRedirect />} />
              
              {/* Auth routes - accessible only when not logged in */}
              <Route path="/signin" element={
                <PublicRoute>
                  <SignIn />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              } />
              
              {/* Auth callback route - for processing auth redirects from Supabase */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Diagnostic route - for testing Supabase connection */}
              <Route path="/auth/diagnose" element={<DiagnoseAuth />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Help />} />
                </Route>
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
