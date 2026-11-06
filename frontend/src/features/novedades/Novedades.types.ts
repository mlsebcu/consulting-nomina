import type { Concepto } from "../conceptos/Conceptos.types";
import type { Empleado } from "../empleados/Empleados.types";

export type ModoCaptura = "CANTIDAD" | "MONTO";

export interface ConceptoCapturable extends Concepto {
    modoCaptura: ModoCaptura;
}

export interface Novedad {
    novedadId: number;
    empleadoId: number;
    empleado?: Empleado;
    periodoId: number;
    conceptoId: number;
    concepto?: Concepto;
    cantidad: number | null;
    monto: number | null;
    observacion: string | null;
}

export interface CreateNovedadDto {
    empleadoId: number;
    periodoId: number;
    conceptoId: number;
    cantidad?: number;
    monto?: number;
    observacion?: string;
}

export type UpdateNovedadDto = Partial<Omit<CreateNovedadDto, "empleadoId" | "periodoId">>;
