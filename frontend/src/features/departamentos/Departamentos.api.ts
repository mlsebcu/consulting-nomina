import { api } from '../../api/axios';
import type { CreateDepartamentoDto, Departamento, UpdateDepartamentoDto } from './Departamentos.types';
 
export const departamentosApi = {
  getAll: () => api.get<Departamento[]>('/departamentos').then((r) => r.data),
  create: (dto: CreateDepartamentoDto) =>
    api.post<Departamento>('/departamentos', dto).then((r) => r.data),
  update: (id: number, dto: UpdateDepartamentoDto) =>
    api.patch<Departamento>(`/departamentos/${id}`, dto).then((r) => r.data),
  remove: (id: number) => api.delete(`/departamentos/${id}`),
};