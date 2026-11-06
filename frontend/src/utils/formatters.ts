const LOCALE = "es-GT";

const moneda = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
});

export function formatMoneda(valor: number | null | undefined): string {
    return moneda.format(Number(valor ?? 0));
}

// Las fechas DATE llegan como "YYYY-MM-DD"; se interpretan en hora local
// para que no se desplacen un día por la zona horaria.
export function formatFecha(fecha: string | null | undefined): string {
    if (!fecha) return "-";
    const [anio, mes, dia] = fecha.slice(0, 10).split("-").map(Number);
    return new Date(anio, mes - 1, dia).toLocaleDateString(LOCALE, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}
