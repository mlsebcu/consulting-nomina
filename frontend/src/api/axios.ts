import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3000/api", // cambiar cuando despliegues a Render/Railway
});

// Adjunta el JWT en cada request, si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const esLogin = error.config?.url?.includes("/auth/login");
        if (error.response?.status === 401 && !esLogin) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("usuario");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);
