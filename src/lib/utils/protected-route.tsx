
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/providers/auth-provider";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loader"></span>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Render children if authenticated
  return <Outlet />;
}
