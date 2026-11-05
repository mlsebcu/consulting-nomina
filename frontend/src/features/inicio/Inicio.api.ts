import { api } from "@/api/axios";
import type { Periodo } from "../periodos/Periodos.types";
import type { Cumpleaniero } from "../reportes/Reportes.types";

export interface ResumenInicio {
    empleadosActivos: number;
    departamentos: number;
    periodo: Periodo | null;
    proceso: { novedades: number; anticipos: number; finMes: number } | null;
    ultimaNomina: {
        periodoId: number;
        anio: number;
        mes: number;
        empleados: number;
        totalIngresos: number;
        totalDescuentos: number;
        totalLiquido: number;
    } | null;
    cumpleanieros: Cumpleaniero[];
}

export const inicioApi = {
    resumen: () => api.get<ResumenInicio>("/inicio/resumen").then((r) => r.data),
};
