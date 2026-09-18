// ============================================================
// NATURALEZAS
// ============================================================
export interface NaturalezaConcepto {
    naturalezaId: number;
    codigo: string;
    nombre: string;
    afectaNeto: boolean;
    esProvision: boolean;
    orden: number;
    activo: boolean;
    fechaCreacion: string;
    fechaModificacion: string | null;
    creadoPor: number | null;
    modificadoPor: number | null;
    eliminadoPor: number | null;
    fechaEliminacion: string | null;
}

export interface CreateNaturalezaDto {
    codigo: string;
    nombre: string;
    afectaNeto: boolean;
    esProvision: boolean;
    orden?: number;
}

export type UpdateNaturalezaDto = Partial<CreateNaturalezaDto>;

// ============================================================
// CONCEPTOS
// ============================================================
export interface Concepto {
    conceptoId: number;
    codigo: string;
    nombre: string;
    naturalezaId: number;
    naturaleza?: NaturalezaConcepto
    tipoCalculo: "FIJO" | "PORCENTAJE" | "FORMULA" | "MANUAL";
    cuentaContable: string | null;
    orden: number;
    esSistema: boolean;
    activo: boolean;
    fechaCreacion: string;
    fechaModificacion: string | null;
    creadoPor: number | null;
    modificadoPor: number | null;
    eliminadoPor: number | null;
    fechaEliminacion: string | null;
}

export interface CreateConceptoDto {
    codigo: string;
    nombre: string;
    naturalezaId: number;
    tipoCalculo: string;
    cuentaContable?: string;
    orden?: number;
    esSistema?: boolean;
}

export type UpdateConceptoDto = Partial<CreateConceptoDto>;

// ============================================================
// REGLAS FISCALES
// ============================================================
export interface ConceptoReglaFiscal {
    conceptoReglaFiscalId: number;
    conceptoId: number;
    pais: string;
    anio: number;
    tipoImpuesto: string;
    esGravable: boolean;
    esBaseCalculo: boolean;
    porcentajeExencion: number | null;
    limiteExencion: number | null;
    activo: boolean;
    fechaCreacion: string;
    fechaModificacion: string | null;
    creadoPor: number | null;
    modificadoPor: number | null;
    eliminadoPor: number | null;
    fechaEliminacion: string | null;
}

export interface CreateReglaFiscalDto {
    pais: string;
    anio: number;
    tipoImpuesto: string;
    esGravable: boolean;
    esBaseCalculo: boolean;
    porcentajeExencion?: number;
    limiteExencion?: number;
}

export type UpdateReglaFiscalDto = Partial<CreateReglaFiscalDto>;
