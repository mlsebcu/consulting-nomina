import { api } from "../../api/axios";
import type {
    CalcularAnticipoDto,
    CalcularNominaDto,
    CerrarNominaDto,
    NominaEmpleado,
    ResultadoCalculo,
} from "./Nomina.types";

export const nominaApi = {
    calcularAnticipo: (dto: CalcularAnticipoDto) =>
        api.post<ResultadoCalculo>("/nomina/anticipo", dto).then((r) => r.data),

    calcularNomina: (dto: CalcularNominaDto) =>
        api.post<ResultadoCalculo>("/nomina/calcular", dto).then((r) => r.data),

    cerrarNomina: (dto: CerrarNominaDto) =>
        api.post<ResultadoCalculo>("/nomina/cerrar", dto).then((r) => r.data),

    listarPorPeriodo: (periodoId: number) =>
        api
            .get<NominaEmpleado[]>(`/nomina/periodo/${periodoId}`)
            .then((r) => r.data),

    obtenerUna: (id: number) =>
        api.get<NominaEmpleado>(`/nomina/${id}`).then((r) => r.data),
};
