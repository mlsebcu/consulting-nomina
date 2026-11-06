import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Estado = "ABIERTO" | "EN_REVISION" | "CERRADO" | "ABIERTA" | "CERRADA";

const ESTILOS: Record<Estado, { etiqueta: string; clase: string }> = {
    ABIERTO: {
        etiqueta: "Abierto",
        clase: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
    ABIERTA: {
        etiqueta: "Abierta",
        clase: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
    EN_REVISION: {
        etiqueta: "En revisión",
        clase: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
    CERRADO: {
        etiqueta: "Cerrado",
        clase: "bg-muted text-muted-foreground",
    },
    CERRADA: {
        etiqueta: "Cerrada",
        clase: "bg-muted text-muted-foreground",
    },
};

export function EstadoBadge({ estado, className }: { estado: Estado; className?: string }) {
    const estilo = ESTILOS[estado];
    return <Badge className={cn(estilo.clase, className)}>{estilo.etiqueta}</Badge>;
}
