import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";

export function ProtectedRoute() {
  const { usuario } = useAuth();
 
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
 
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}