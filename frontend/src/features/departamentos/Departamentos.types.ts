export interface Departamento {
  departamentoId: number;
  nombre: string;
  cuentaContable: string;
}
 
export interface CreateDepartamentoDto {
  nombre: string;
  cuentaContable: string;
}
 
export type UpdateDepartamentoDto = Partial<CreateDepartamentoDto>;