import { isAxiosError } from "axios";

export function mensajeError(error: unknown, porDefecto: string): string {
    if (isAxiosError<{ message?: string | string[] }>(error)) {
        const mensaje = error.response?.data?.message;
        if (Array.isArray(mensaje)) return mensaje.join(". ");
        if (mensaje) return mensaje;
        if (!error.response) return "No hay conexión con el servidor.";
    }
    return porDefecto;
}
