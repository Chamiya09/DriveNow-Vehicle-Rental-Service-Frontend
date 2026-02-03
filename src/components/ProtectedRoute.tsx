import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "USER" | "ADMIN" | "DRIVER";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, token, isLoading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && (!token || !user)) {
      toast.error("Please login to access this page");
      setShouldRedirect(true);
    } else if (!isLoading && requiredRole && user?.role !== requiredRole) {
      toast.error("You don't have permission to access this page");
      setShouldRedirect(true);
    }
  }, [isLoading, token, user, requiredRole]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if user doesn't have required role
  if (requiredRole && user.role !== requiredRole) {
    // Redirect admin to admin dashboard, users to user dashboard
    const redirectPath = user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/user";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
