import type { Departamento } from "../departamentos/Departamentos.types";

export const GENEROS = {
    MASCULINO: "Masculino",
    FEMENINO: "Femenino",
    OTRO: "Otro",
} as const;

export const ESTADOS_CIVILES = {
    SOLTERO: "Soltero",
    CASADO: "Casado",
    DIVORCIADO: "Divorciado",
    VIUDO: "Viudo",
    UNION_LIBRE: "Unión libre",
} as const;

export const TIPOS_CUENTA = {
    MONETARIA: "Monetaria",
    AHORRO: "Ahorro",
} as const;

export type Genero = keyof typeof GENEROS;
export type EstadoCivil = keyof typeof ESTADOS_CIVILES;
export type TipoCuenta = keyof typeof TIPOS_CUENTA;

export interface Empleado {
    empleadoId: number;
    codigoEmpleado: string;
    nombres: string;
    apellidos: string;
    dpi: string;
    nit: string | null;
    fechaNacimiento: string;
    genero: Genero;
    estadoCivil: EstadoCivil;
    direccion: string;
    telefonoMovil: string;
    correoPersonal: string;
    correoCorporativo: string;
    contactoEmergenciaNombre: string;
    contactoEmergenciaTelefono: string;
    banco: string;
    tipoCuenta: TipoCuenta;
    numeroCuenta: string;
    fechaIngreso: string;
    fechaBaja: string | null;
    puesto: string;
    salarioBase: number;
    diasLaborados: number;
    departamentoId: number;
    departamento?: Departamento;
    activo: boolean;
}

export type CreateEmpleadoDto = Omit<
    Empleado,
    "empleadoId" | "nit" | "fechaBaja" | "departamento" | "activo"
> & { nit?: string };

export type UpdateEmpleadoDto = Partial<CreateEmpleadoDto>;
