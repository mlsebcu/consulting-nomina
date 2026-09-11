export function formatMoneda(valor: number): string {
    return `Q ${valor.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
}

export function formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString("es-GT");
}
