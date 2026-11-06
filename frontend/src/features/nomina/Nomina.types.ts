import type { Empleado } from "../empleados/Empleados.types";
import type { Periodo } from "../periodos/Periodos.types";

export type TipoNomina = "ANTICIPO" | "FINMES";

export interface NominaDetalle {
    nominaDetalleId: number;
    conceptoId: number;
    conceptoCodigo: string;
    conceptoNombre: string;
    naturalezaCodigo: "PERCEPCION" | "DEDUCCION" | "PROVISION" | string;
    cantidad: number | null;
    monto: number;
    orden: number;
}

export interface NominaEmpleado {
    nominaEmpleadoId: number;
    empleadoId: number;
    empleado?: Empleado;
    periodoId: number;
    periodo?: Periodo;
    tipoNomina: TipoNomina;
    diasLaborados: number;
    totalPercepciones: number;
    totalDeducciones: number;
    totalProvisiones: number;
    anticipo: number;
    liquido: number;
    estado: "ABIERTA" | "CERRADA";
    fechaCalculo: string;
    detalles?: NominaDetalle[];
}

export interface ResultadoProceso {
    mensaje: string;
    periodoId: number;
    totalNominas: number;
}
