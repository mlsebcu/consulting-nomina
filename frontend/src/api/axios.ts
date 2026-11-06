import axios from "axios";
import { sesion } from "@/lib/sesion";

const HTTP_UNAUTHORIZED = 401;

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const token = sesion.token();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const esLogin = error.config?.url?.includes("/auth/login");
        if (error.response?.status === HTTP_UNAUTHORIZED && !esLogin) {
            sesion.limpiar();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);
