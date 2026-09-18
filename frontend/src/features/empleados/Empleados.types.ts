export interface Empleado {
  empleadoId: number;
  codigoEmpleado: string;
  nombres: string;
  apellidos: string;
  dpi: string;
  nit: string | null;
  fechaNacimiento: string;
  genero: string;
  estadoCivil: string;
  direccion: string;
  telefonoMovil: string;
  correoPersonal: string;
  correoCorporativo: string;
  contactoEmergenciaNombre: string;
  contactoEmergenciaTelefono: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  fechaIngreso: string;
  fechaBaja: string | null;
  puesto: string;
  salarioBase: number;
  diasLaborados: number;
  departamentoId: number;
  departamento?: {
    departamentoId: number;
    nombre: string;
    cuentaContable: string;
  };
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string | null;
  creadoPor: number | null;
  modificadoPor: number | null;
  eliminadoPor: number | null;
  fechaEliminacion: string | null;
}

export interface CreateEmpleadoDto {
  codigoEmpleado: string;
  nombres: string;
  apellidos: string;
  dpi: string;
  nit?: string;
  fechaNacimiento: string;
  genero: string;
  estadoCivil: string;
  direccion: string;
  telefonoMovil: string;
  correoPersonal: string;
  correoCorporativo: string;
  contactoEmergenciaNombre: string;
  contactoEmergenciaTelefono: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  fechaIngreso: string;
  puesto: string;
  salarioBase: number;
  diasLaborados: number;
  departamentoId: number;
}

export type UpdateEmpleadoDto = Partial<CreateEmpleadoDto>;