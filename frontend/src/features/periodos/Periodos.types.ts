export interface Periodo {
    periodoId: number;
    anio: number;
    mes: number;
    quincena: number | null;
    numeroPeriodo: number;
    tipoPeriodo: "QUINCENAL" | "MENSUAL";
    fechaInicio: string;
    fechaFin: string;
    estado: "ABIERTO" | "EN_REVISION" | "CERRADO";
    fechaCierre: string | null;
    cerradoPor: number | null;
    activo: boolean;
    fechaCreacion: string;
    fechaModificacion: string | null;
    creadoPor: number | null;
    modificadoPor: number | null;
    eliminadoPor: number | null;
    fechaEliminacion: string | null;
}

export interface CreatePeriodoDto {
    anio: number;
    mes: number;
    quincena?: number;
    numeroPeriodo: number;
    tipoPeriodo: "QUINCENAL" | "MENSUAL";
    fechaInicio: string;
    fechaFin: string;
}

export type UpdatePeriodoDto = Partial<CreatePeriodoDto>;
