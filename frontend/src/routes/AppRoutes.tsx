import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Login from "@/features/auth/Login";
import { RUTA_INICIAL } from "./navegacion";
import { ProtectedRoute } from "./ProtectedRoute";

const ConceptosPage = lazy(() => import("@/features/conceptos/ConceptosPage"));
const DepartamentosPage = lazy(() => import("@/features/departamentos/DepartamentosPage"));
const EmpleadosPage = lazy(() => import("@/features/empleados/EmpleadosPage"));
const NominaPage = lazy(() => import("@/features/nomina/NominaPage"));
const NovedadesPage = lazy(() => import("@/features/novedades/NovedadesPage"));
const ParametrosPage = lazy(() => import("@/features/parametros/ParametrosPage"));
const PeriodosPage = lazy(() => import("@/features/periodos/PeriodosPage"));
const ReportesPage = lazy(() => import("@/features/reportes/ReportesPage"));

function Cargando() {
    return (
        <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
    );
}

export function AppRoutes() {
    return (
        <Suspense fallback={<Cargando />}>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Navigate to={RUTA_INICIAL} replace />} />
                    <Route path="/empleados" element={<EmpleadosPage />} />
                    <Route path="/departamentos" element={<DepartamentosPage />} />
                    <Route path="/conceptos" element={<ConceptosPage />} />
                    <Route path="/parametros" element={<ParametrosPage />} />
                    <Route path="/periodos" element={<PeriodosPage />} />
                    <Route path="/novedades" element={<NovedadesPage />} />
                    <Route path="/nomina" element={<NominaPage />} />
                    <Route path="/reportes" element={<ReportesPage />} />
                </Route>

                <Route path="*" element={<Navigate to={RUTA_INICIAL} replace />} />
            </Routes>
        </Suspense>
    );
}
