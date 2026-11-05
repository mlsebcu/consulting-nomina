import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { periodosApi } from "@/features/periodos/Periodos.api";
import type { Periodo } from "@/features/periodos/Periodos.types";
import { cn } from "@/lib/utils";
import { nombrePeriodo } from "@/utils/periodos";

interface Props {
    value: number | null;
    onChange: (periodo: Periodo) => void;
    soloAbiertos?: boolean;
    seleccionarPrimero?: boolean;
    recargar?: number;
    className?: string;
}

export function PeriodoSelect({
    value,
    onChange,
    soloAbiertos = false,
    seleccionarPrimero = false,
    recargar = 0,
    className,
}: Props) {
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        let vigente = true;
        const consulta = soloAbiertos ? periodosApi.getAbiertos() : periodosApi.getAll();
        consulta
            .then((data) => {
                if (!vigente) return;
                setPeriodos(data);
                const actual = data.find((p) => p.periodoId === value);
                if (actual) onChange(actual);
                else if (seleccionarPrimero && data.length > 0) onChange(data[0]);
            })
            .catch(() => vigente && setPeriodos([]))
            .finally(() => vigente && setCargando(false));
        return () => {
            vigente = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [soloAbiertos, recargar]);

    const sinPeriodos = !cargando && periodos.length === 0;

    return (
        <div className={cn("grid gap-2", className)}>
            <Label htmlFor="periodo">Período</Label>
            <Select
                value={value ? String(value) : ""}
                onValueChange={(v) => {
                    const periodo = periodos.find((p) => String(p.periodoId) === v);
                    if (periodo) onChange(periodo);
                }}
                disabled={cargando || sinPeriodos}
            >
                <SelectTrigger id="periodo" className="w-full sm:w-80">
                    <SelectValue
                        placeholder={
                            sinPeriodos
                                ? soloAbiertos
                                    ? "No hay períodos abiertos"
                                    : "No hay períodos registrados"
                                : "Seleccione un período"
                        }
                    >
                        {(v: string) => {
                            const periodo = periodos.find((p) => String(p.periodoId) === v);
                            return periodo ? nombrePeriodo(periodo) : null;
                        }}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {periodos.map((p) => (
                        <SelectItem key={p.periodoId} value={String(p.periodoId)}>
                            {nombrePeriodo(p)}
                            {p.estado === "CERRADO" && (
                                <span className="text-xs text-muted-foreground">(cerrado)</span>
                            )}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
