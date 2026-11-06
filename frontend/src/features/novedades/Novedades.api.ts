import { api } from "@/api/axios";
import type {
    ConceptoCapturable,
    CreateNovedadDto,
    Novedad,
    UpdateNovedadDto,
} from "./Novedades.types";

export const novedadesApi = {
    conceptos: () =>
        api.get<ConceptoCapturable[]>("/novedades/conceptos").then((r) => r.data),

    porPeriodo: (periodoId: number) =>
        api.get<Novedad[]>("/novedades", { params: { periodoId } }).then((r) => r.data),

    create: (dto: CreateNovedadDto) =>
        api.post<Novedad>("/novedades", dto).then((r) => r.data),

    update: (id: number, dto: UpdateNovedadDto) =>
        api.patch<Novedad>(`/novedades/${id}`, dto).then((r) => r.data),

    remove: (id: number) => api.delete(`/novedades/${id}`),
};
