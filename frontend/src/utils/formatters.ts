export function formatMoneda(valor: number): string {
  return `Q ${valor.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
}

export function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}