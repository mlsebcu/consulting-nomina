import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import App from "./App.tsx";
import "./App.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
        <Toaster position="top-right" richColors closeButton />
    </StrictMode>,
);
