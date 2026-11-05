import { api } from "@/api/axios";
import type { NominaEmpleado, ResultadoProceso } from "./Nomina.types";

export const nominaApi = {
    calcularAnticipo: (periodoId: number) =>
        api.post<ResultadoProceso>("/nomina/anticipo", { periodoId }).then((r) => r.data),

    calcularNomina: (periodoId: number) =>
        api.post<ResultadoProceso>("/nomina/calcular", { periodoId }).then((r) => r.data),

    cerrarNomina: (periodoId: number) =>
        api.post<ResultadoProceso>("/nomina/cerrar", { periodoId }).then((r) => r.data),

    listarPorPeriodo: (periodoId: number) =>
        api.get<NominaEmpleado[]>(`/nomina/periodo/${periodoId}`).then((r) => r.data),

    obtenerUna: (id: number) => api.get<NominaEmpleado>(`/nomina/${id}`).then((r) => r.data),
};
