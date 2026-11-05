export type Rol = "ADMIN" | "RRHH";

export interface UsuarioSesion {
    nombreUsuario: string;
    rol: Rol;
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
