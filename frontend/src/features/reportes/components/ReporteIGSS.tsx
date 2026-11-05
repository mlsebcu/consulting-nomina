import { ShieldCheck } from "lucide-react";
import { reportesApi } from "../Reportes.api";
import { ReporteDescuento } from "./ReporteDescuento";

export function ReporteIGSS() {
    return (
        <ReporteDescuento
            titulo="Descuentos de IGSS"
            descripcion="Cuota laboral retenida a cada empleado en la nómina de fin de mes."
            icono={ShieldCheck}
            columnaMonto="IGSS"
            consultar={reportesApi.igss}
        />
    );
}
