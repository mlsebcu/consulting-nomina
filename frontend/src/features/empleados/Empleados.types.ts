import type { Departamento } from "../departamentos/Departamentos.types";

export interface Empleado {
    empleadoId: number;
    nombre: string;
    fechaNacimiento: string;
    fechaIngreso: string;
    salarioBase: number;
    diasLaborados: number;
    departamentoId: number;
    departamento?: Departamento;
    activo: boolean;
}

export interface CreateEmpleadoDto {
    nombre: string;
    fechaNacimiento: string;
    fechaIngreso: string;
    salarioBase: number;
    diasLaborados: number;
    departamentoId: number;
}

export interface UpdateEmpleadoDto extends CreateEmpleadoDto {
    id: number;
}
