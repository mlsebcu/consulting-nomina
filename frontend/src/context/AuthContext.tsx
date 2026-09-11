import { createContext, useContext, useState, type ReactNode } from "react";
import { api } from "../api/axios";

interface Usuario {
    nombreUsuario: string;
    rol: "ADMIN" | "RRHH";
}

interface AuthContextType {
    usuario: Usuario | null;
    login: (nombreUsuario: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(() => {
        const stored = localStorage.getItem("usuario");
        return stored ? JSON.parse(stored) : null;
    });

    async function login(nombreUsuario: string, password: string) {
        const { data } = await api.post("/auth/login", {
            nombreUsuario,
            password,
        });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        setUsuario(data.usuario);
    }

    function logout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("usuario");
        setUsuario(null);
    }

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return context;
}
