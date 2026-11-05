import { api } from "@/api/axios";
import type { Rol } from "@/lib/sesion";

export interface Usuario {
    usuarioId: number;
    nombreUsuario: string;
    rol: Rol;
    activo: boolean;
    fechaCreacion: string;
}

export interface CreateUsuarioDto {
    nombreUsuario: string;
    rol: Rol;
    password: string;
}

export const usuariosApi = {
    getAll: () => api.get<Usuario[]>("/usuarios").then((r) => r.data),

    create: (dto: CreateUsuarioDto) => api.post<Usuario>("/usuarios", dto).then((r) => r.data),

    update: (id: number, dto: Partial<Pick<Usuario, "rol" | "activo">>) =>
        api.patch<Usuario>(`/usuarios/${id}`, dto).then((r) => r.data),

    cambiarPassword: (id: number, password: string) =>
        api.patch(`/usuarios/${id}/password`, { password }),
};
