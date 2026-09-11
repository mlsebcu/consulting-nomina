import { api } from "../../api/axios";
import type { CreateEmpleadoDto, Empleado } from "./Empleados.types";

export const empleadosApi = {
    getAll: () => api.get<Empleado[]>("/empleados").then((r) => r.data),
    create: (dto: CreateEmpleadoDto) =>
        api.post<Empleado>("/empleados", dto).then((r) => r.data),
    remove: (id: number) => api.delete(`/empleados/${id}`),
};
