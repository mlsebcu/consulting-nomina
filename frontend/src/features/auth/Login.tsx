import { Navigate } from "react-router-dom";
import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/context/AuthContext";
import { RUTA_INICIAL } from "@/routes/navegacion";

export default function Login() {
    const { usuario } = useAuth();

    if (usuario) {
        return <Navigate to={RUTA_INICIAL} replace />;
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <LoginForm />
            </div>
        </div>
    );
}
