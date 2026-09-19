import type { Empleado } from "../empleados/Empleados.types";
import type { Periodo } from "../periodos/Periodos.types";

export interface NominaEmpleado {
    nominaEmpleadoId: number;
    empleadoId: number;
    empleado?: Empleado;
    periodoId: number;
    periodo?: Periodo;
    tipoNomina: "ANTICIPO" | "FINMES";
    totalPercepciones: number;
    totalDeducciones: number;
    totalProvisiones: number;
    anticipo: number;
    liquido: number;
    estado: "ABIERTA" | "CERRADA";
    fechaCalculo: string;
    activo: boolean;
    fechaCreacion: string;
    fechaModificacion: string | null;
    creadoPor: number | null;
    modificadoPor: number | null;
    eliminadoPor: number | null;
    fechaEliminacion: string | null;
    detalles?: NominaDetalle[];
}

export interface NominaDetalle {
    nominaDetalleId: number;
    nominaEmpleadoId: number;
    conceptoId: number;
    conceptoCodigo: string;
    conceptoNombre: string;
    naturalezaCodigo: string;
    monto: number;
    orden: number;
}

export interface CalcularAnticipoDto {
    periodoId: number;
}

export interface CalcularNominaDto {
    periodoId: number;
}

export interface CerrarNominaDto {
    periodoId: number;
}

export interface ResultadoCalculo {
    mensaje: string;
    periodoId: number;
    totalNominas: number;
}
