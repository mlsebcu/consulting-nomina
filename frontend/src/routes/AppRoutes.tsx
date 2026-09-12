import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import Login from "../features/auth/Login";
import DepartamentosPage from "../features/departamentos/DepartamentosPage";
import EmpleadosPage from "../features/empleados/EmpleadosPage";

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
                <Route
                    path="/"
                    element={<Navigate to="/empleados" replace />}
                />
                <Route path="/empleados" element={<EmpleadosPage />} />
                <Route path="/departamentos" element={<DepartamentosPage />} />
                {/* <Route path="/nomina" element={<NominaPage />} /> */}
                {/* <Route path="/reportes" element={<ReportesPage />} /> */}
            </Route>
        </Routes>
    );
}
