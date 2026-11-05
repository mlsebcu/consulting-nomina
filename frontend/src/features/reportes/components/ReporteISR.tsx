import { Landmark } from "lucide-react";
import { reportesApi } from "../Reportes.api";
import { ReporteDescuento } from "./ReporteDescuento";

export function ReporteISR() {
    return (
        <ReporteDescuento
            titulo="Descuentos de ISR"
            descripcion="Retención mensual de ISR sobre la renta proyectada de cada empleado."
            icono={Landmark}
            columnaMonto="ISR"
            consultar={reportesApi.isr}
        />
    );
}
