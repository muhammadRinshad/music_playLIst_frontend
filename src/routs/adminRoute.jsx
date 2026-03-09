import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token) {
    return <Navigate to="/" replace />;
  }
  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
