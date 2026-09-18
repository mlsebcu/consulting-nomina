import { api } from "../../api/axios";
import type {
    Concepto,
    ConceptoReglaFiscal,
    CreateConceptoDto,
    CreateNaturalezaDto,
    CreateReglaFiscalDto,
    NaturalezaConcepto,
    UpdateConceptoDto,
    UpdateNaturalezaDto,
    UpdateReglaFiscalDto,
} from "./Conceptos.types";

export const conceptosApi = {
    // ============================================================
    // NATURALEZAS
    // ============================================================
    getAllNaturalezas: () =>
        api
            .get<NaturalezaConcepto[]>("/conceptos/naturalezas")
            .then((r) => r.data),

    createNaturaleza: (dto: CreateNaturalezaDto) =>
        api
            .post<NaturalezaConcepto>("/conceptos/naturalezas", dto)
            .then((r) => r.data),

    updateNaturaleza: (id: number, dto: UpdateNaturalezaDto) =>
        api
            .patch<NaturalezaConcepto>(`/conceptos/naturalezas/${id}`, dto)
            .then((r) => r.data),

    removeNaturaleza: (id: number) =>
        api.delete(`/conceptos/naturalezas/${id}`),

    // ============================================================
    // CONCEPTOS
    // ============================================================
    getAllConceptos: () =>
        api.get<Concepto[]>("/conceptos").then((r) => r.data),

    createConcepto: (dto: CreateConceptoDto) =>
        api.post<Concepto>("/conceptos", dto).then((r) => r.data),

    updateConcepto: (id: number, dto: UpdateConceptoDto) =>
        api.patch<Concepto>(`/conceptos/${id}`, dto).then((r) => r.data),

    removeConcepto: (id: number) => api.delete(`/conceptos/${id}`),

    // ============================================================
    // REGLAS FISCALES
    // ============================================================
    getReglasFiscales: (conceptoId: number) =>
        api
            .get<ConceptoReglaFiscal[]>(
                `/conceptos/${conceptoId}/reglas-fiscales`,
            )
            .then((r) => r.data),

    createReglaFiscal: (conceptoId: number, dto: CreateReglaFiscalDto) =>
        api
            .post<ConceptoReglaFiscal>(
                `/conceptos/${conceptoId}/reglas-fiscales`,
                dto,
            )
            .then((r) => r.data),

    updateReglaFiscal: (
        conceptoId: number,
        reglaId: number,
        dto: UpdateReglaFiscalDto,
    ) =>
        api
            .patch<ConceptoReglaFiscal>(
                `/conceptos/${conceptoId}/reglas-fiscales/${reglaId}`,
                dto,
            )
            .then((r) => r.data),

    removeReglaFiscal: (conceptoId: number, reglaId: number) =>
        api.delete(`/conceptos/${conceptoId}/reglas-fiscales/${reglaId}`),
};
