import { Navigate } from "react-router-dom";
import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/context/AuthContext";
import { RUTA_INICIAL } from "@/routes/navegacion";

const ANIO_ACTUAL = new Date().getFullYear();

export default function Login() {
    const { usuario } = useAuth();

    if (usuario) {
        return <Navigate to={RUTA_INICIAL} replace />;
    }

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-primary px-4 py-10">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(255,255,255,0.12),transparent_40%)]"
            />
            <main className="relative w-full max-w-sm">
                <LoginForm />
                <p className="mt-6 text-center text-xs text-primary-foreground/80">
                    Acceso exclusivo para personal autorizado.
                </p>
            </main>
            <footer className="absolute bottom-4 text-xs text-primary-foreground/60">
                © {ANIO_ACTUAL} Starcode.biz
            </footer>
        </div>
    );
}
