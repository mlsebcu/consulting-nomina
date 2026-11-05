export type Rol = "ADMIN" | "RRHH";

export interface UsuarioSesion {
    nombreUsuario: string;
    nombreCompleto?: string;
    rol: Rol;
}

export function nombreVisible(usuario: UsuarioSesion): string {
    return usuario.nombreCompleto || usuario.nombreUsuario;
}

export function iniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/);
    const letras = partes.length > 1 ? partes[0][0] + partes[1][0] : nombre.slice(0, 2);
    return letras.toUpperCase();
}

const TOKEN_KEY = "accessToken";
const USUARIO_KEY = "usuario";

export const sesion = {
    token: () => sessionStorage.getItem(TOKEN_KEY),

    usuario(): UsuarioSesion | null {
        const guardado = sessionStorage.getItem(USUARIO_KEY);
        return guardado ? (JSON.parse(guardado) as UsuarioSesion) : null;
    },

    guardar(token: string, usuario: UsuarioSesion) {
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    },

    limpiar() {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USUARIO_KEY);
    },
};
