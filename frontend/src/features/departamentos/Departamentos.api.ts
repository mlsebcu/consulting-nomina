import { api } from "../../api/axios";
import type { Departamento } from "./Departamentos.types";

export const departamentosApi = {
    getAll: () => api.get<Departamento[]>("/departamentos").then((r) => r.data),
};
