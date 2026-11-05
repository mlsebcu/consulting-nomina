import { api } from "@/api/axios";

export interface Parametro {
    parametroId: number;
    codigo: string;
    descripcion: string;
    tipoDato: "NUMERO" | "TEXTO";
    valor: string;
    anio: number;
    fechaModificacion: string | null;
}

export const parametrosApi = {
    anios: () => api.get<number[]>("/parametros/anios").then((r) => r.data),

    porAnio: (anio: number) =>
        api.get<Parametro[]>("/parametros", { params: { anio } }).then((r) => r.data),

    update: (id: number, valor: string) =>
        api.patch<Parametro>(`/parametros/${id}`, { valor }).then((r) => r.data),

    copiar: (anioOrigen: number, anioDestino: number) =>
        api.post<Parametro[]>("/parametros/copiar", { anioOrigen, anioDestino }).then((r) => r.data),
};
