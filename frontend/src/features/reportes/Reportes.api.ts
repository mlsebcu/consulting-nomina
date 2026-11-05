import { api } from "@/api/axios";
import type {
    ReporteCumpleanieros,
    ReporteDescuento,
    ReporteLibroSalarios,
    ReportePoliza,
} from "./Reportes.types";

export const reportesApi = {
    cumpleanieros: (mes: number) =>
        api
            .get<ReporteCumpleanieros>("/reportes/cumpleanieros", { params: { mes } })
            .then((r) => r.data),

    igss: (periodoId: number) =>
        api.get<ReporteDescuento>(`/reportes/igss/${periodoId}`).then((r) => r.data),

    isr: (periodoId: number) =>
        api.get<ReporteDescuento>(`/reportes/isr/${periodoId}`).then((r) => r.data),

    poliza: (periodoId: number) =>
        api.get<ReportePoliza>(`/reportes/poliza/${periodoId}`).then((r) => r.data),

    libroSalarios: (periodoId: number) =>
        api
            .get<ReporteLibroSalarios>(`/reportes/libro-salarios/${periodoId}`)
            .then((r) => r.data),
};
