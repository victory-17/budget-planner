
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/lib/providers/auth-provider";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { Layout } from "@/components/layout/layout";
import { ProtectedRoute } from "@/lib/utils/protected-route";

// Auth Pages
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";

// Main Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Accounts from "./pages/accounts/Accounts";
import Transactions from "./pages/transactions/Transactions";
import Budgets from "./pages/budgets/Budgets";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";
import Help from "./pages/help/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Redirect root to signin */}
              <Route path="/" element={<Navigate to="/signin" replace />} />
              
              {/* Auth routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/accounts" element={<Accounts />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/budgets" element={<Budgets />} />
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
