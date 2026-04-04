import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/api-client";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = getAuthToken();
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    toast.error("Please log in to access this page");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && userRole && !allowedRoles.includes(userRole)) {
    toast.error("You do not have permission to access this page");
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
