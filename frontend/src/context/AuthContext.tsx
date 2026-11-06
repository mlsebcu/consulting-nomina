import { createContext, useContext, useState, type ReactNode } from "react";
import { api } from "@/api/axios";
import { sesion, type UsuarioSesion } from "@/lib/sesion";

interface LoginResponse {
    accessToken: string;
    usuario: UsuarioSesion;
}

interface AuthContextType {
    usuario: UsuarioSesion | null;
    esAdmin: boolean;
    login: (nombreUsuario: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<UsuarioSesion | null>(sesion.usuario);

    async function login(nombreUsuario: string, password: string) {
        const { data } = await api.post<LoginResponse>("/auth/login", {
            nombreUsuario,
            password,
        });
        sesion.guardar(data.accessToken, data.usuario);
        setUsuario(data.usuario);
    }

    function logout() {
        sesion.limpiar();
        setUsuario(null);
    }

    return (
        <AuthContext.Provider
            value={{ usuario, esAdmin: usuario?.rol === "ADMIN", login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return context;
}
