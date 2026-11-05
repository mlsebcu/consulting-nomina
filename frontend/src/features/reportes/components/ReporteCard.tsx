import { useEffect, useState, type ReactNode } from "react";
import { Loader2, PrinterIcon, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { mensajeError } from "@/utils/errores";

interface Props {
    titulo: string;
    descripcion: string;
    icono: LucideIcon;
    filtros: ReactNode;
    cargando: boolean;
    error: string;
    hayDatos: boolean;
    children: ReactNode;
}

export function ReporteCard({
    titulo,
    descripcion,
    icono: Icono,
    filtros,
    cargando,
    error,
    hayDatos,
    children,
}: Props) {
    return (
        <Card className="print:border-0 print:shadow-none">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1.5">
                    <CardTitle className="flex items-center gap-2">
                        <Icono className="size-5" />
                        {titulo}
                    </CardTitle>
                    <CardDescription>{descripcion}</CardDescription>
                </div>
                <div className="flex flex-wrap items-end gap-2 print:hidden">
                    {filtros}
                    <Button variant="outline" onClick={() => window.print()} disabled={!hayDatos}>
                        <PrinterIcon />
                        Imprimir
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {cargando ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useReporte<T>(consulta: (() => Promise<T>) | null, dependencia: unknown) {
    const [datos, setDatos] = useState<T | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!consulta) return;
        let vigente = true;
        setCargando(true);
        setError("");
        consulta()
            .then((resultado) => vigente && setDatos(resultado))
            .catch((err) => {
                if (!vigente) return;
                setDatos(null);
                setError(mensajeError(err, "No se pudo generar el reporte."));
            })
            .finally(() => vigente && setCargando(false));
        return () => {
            vigente = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dependencia]);

    return { datos, cargando, error };
}
