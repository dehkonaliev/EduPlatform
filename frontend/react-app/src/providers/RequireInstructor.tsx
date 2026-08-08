import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

/** Wrap any route that only instructors (or superusers) may access. */
export function RequireInstructor({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null; // still restoring session — avoid a flash-redirect
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user.user_role !== "INSTRUCTOR" && user.user_role !== "SUPERUSER") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
