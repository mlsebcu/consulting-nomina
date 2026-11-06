export interface Departamento {
  departamentoId: number;
  nombre: string;
  cuentaContable: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string | null;
  creadoPor: number | null;
  modificadoPor: number | null;
  eliminadoPor: number | null;
  fechaEliminacion: string | null;
}

export interface CreateDepartamentoDto {
  nombre: string;
  cuentaContable: string;
}

export type UpdateDepartamentoDto = Partial<CreateDepartamentoDto>;