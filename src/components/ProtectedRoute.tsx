import { Navigate, Outlet } from "react-router-dom";
import { toast } from "@/lib/island-toast-api";
import { getAuthToken, getUserRole } from "@/lib/api-client";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = getAuthToken();
  const userRole = getUserRole();

  if (!token) {
    toast.error("Please log in to access this page");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && (!userRole || !allowedRoles.includes(userRole))) {
    toast.error("You do not have permission to access this page");
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
