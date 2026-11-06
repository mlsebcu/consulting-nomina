import { api } from "../../api/axios";
import type {
    CreatePeriodoDto,
    Periodo,
    UpdatePeriodoDto,
} from "./Periodos.types";

export const periodosApi = {
    getAll: () => api.get<Periodo[]>("/periodos").then((r) => r.data),

    getAbiertos: () =>
        api.get<Periodo[]>("/periodos/abiertos").then((r) => r.data),

    getOne: (id: number) =>
        api.get<Periodo>(`/periodos/${id}`).then((r) => r.data),

    create: (dto: CreatePeriodoDto) =>
        api.post<Periodo>("/periodos", dto).then((r) => r.data),

    update: (id: number, dto: UpdatePeriodoDto) =>
        api.patch<Periodo>(`/periodos/${id}`, dto).then((r) => r.data),

    remove: (id: number) => api.delete(`/periodos/${id}`),

    cerrar: (id: number) =>
        api.post<Periodo>(`/periodos/${id}/cerrar`).then((r) => r.data),
};
