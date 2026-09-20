import { api } from "../../api/axios";
import type {
    ReporteCumpleanierosResponse,
    ReporteIGSSResponse,
    ReporteISRResponse,
    ReporteLibroSalariosResponse,
    ReportePolizaResponse,
    ReporteReciboResponse,
} from "./Reportes.types";

export const reportesApi = {
    cumpleanieros: (mes: number) =>
        api
            .get<ReporteCumpleanierosResponse>("/reportes/cumpleanieros", {
                params: { mes },
            })
            .then((r) => r.data),

    igss: (periodoId: number) =>
        api
            .get<ReporteIGSSResponse>(`/reportes/igss/${periodoId}`)
            .then((r) => r.data),

    isr: (periodoId: number) =>
        api
            .get<ReporteISRResponse>(`/reportes/isr/${periodoId}`)
            .then((r) => r.data),

    poliza: (periodoId: number) =>
        api
            .get<ReportePolizaResponse>(`/reportes/poliza/${periodoId}`)
            .then((r) => r.data),

    libroSalarios: (periodoId: number) =>
        api
            .get<ReporteLibroSalariosResponse>(
                `/reportes/libro-salarios/${periodoId}`,
            )
            .then((r) => r.data),

    recibo: (nominaEmpleadoId: number) =>
        api
            .get<ReporteReciboResponse>(`/reportes/recibo/${nominaEmpleadoId}`)
            .then((r) => r.data),
};
