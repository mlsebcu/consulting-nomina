import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { RUTA_INICIAL } from "./navegacion";

export function AdminRoute() {
    const { esAdmin } = useAuth();
    return esAdmin ? <Outlet /> : <Navigate to={RUTA_INICIAL} replace />;
}
