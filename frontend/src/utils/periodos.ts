import type { Periodo } from "@/features/periodos/Periodos.types";
import { formatFecha } from "./formatters";

export const MESES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
] as const;

export function nombreMes(mes: number): string {
    return MESES[mes - 1] ?? "";
}

export function nombrePeriodo(p: Periodo): string {
    const frecuencia =
        p.tipoPeriodo === "QUINCENAL" ? `${p.quincena}a. quincena` : "Mensual";
    return `${nombreMes(p.mes)} ${p.anio}, ${frecuencia}`;
}

export function rangoPeriodo(p: Periodo): string {
    return `${formatFecha(p.fechaInicio)} al ${formatFecha(p.fechaFin)}`;
}
