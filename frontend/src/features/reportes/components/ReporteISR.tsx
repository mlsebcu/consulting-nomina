import { useEffect, useState } from "react";
import type { FilaISR } from "../Reportes.types";
import { reportesApi } from "../Reportes.api";
import { periodosApi } from "../../periodos/Periodos.api";
import type { Periodo } from "../../periodos/Periodos.types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, ReceiptIcon } from "lucide-react";
import { formatMoneda } from "@/utils/formatters";

const MESES = [
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
];

export function ReporteISR() {
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [periodoId, setPeriodoId] = useState<number | null>(null);
    const [lista, setLista] = useState<FilaISR[]>([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const [cargandoPeriodos, setCargandoPeriodos] = useState(false);
    const [buscado, setBuscado] = useState(false);

    useEffect(() => {
        cargarPeriodos();
    }, []);

    async function cargarPeriodos() {
        setCargandoPeriodos(true);
        try {
            setPeriodos(await periodosApi.getAll());
        } catch {
            setError("No se pudieron cargar los períodos.");
        } finally {
            setCargandoPeriodos(false);
        }
    }

    async function generar() {
        if (!periodoId) return;
        setError("");
        setCargando(true);
        try {
            const data = await reportesApi.isr(periodoId);
            setLista(data.lista);
            setTotal(data.total.totalISR);
            setBuscado(true);
        } catch {
            setError("No se pudo generar el reporte.");
            setLista([]);
        } finally {
            setCargando(false);
        }
    }

    function nombrePeriodo(p: Periodo) {
        return `#${p.numeroPeriodo} — ${MESES[p.mes - 1]} ${p.anio} — ${
            p.tipoPeriodo === "QUINCENAL"
                ? `${p.quincena}ª quincena`
                : "Mensual"
        }`;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ReceiptIcon className="h-5 w-5" />
                    Retenciones de ISR
                </CardTitle>
                <CardDescription>
                    Detalle de retenciones de ISR por período.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-end gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="periodoId">Período</Label>
                        <Select
                            value={periodoId ? String(periodoId) : ""}
                            onValueChange={(v) => v && setPeriodoId(Number(v))}
                            disabled={cargandoPeriodos}
                        >
                            <SelectTrigger id="periodoId" className="w-80">
                                <SelectValue placeholder="Seleccione un período" />
                            </SelectTrigger>
                            <SelectContent>
                                {periodos.map((p) => (
                                    <SelectItem
                                        key={p.periodoId}
                                        value={String(p.periodoId)}
                                    >
                                        {nombrePeriodo(p)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={generar} disabled={cargando || !periodoId}>
                        {cargando ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="mr-2 h-4 w-4" />
                        )}
                        Generar
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {buscado && !cargando && (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Empleado</TableHead>
                                    <TableHead>Departamento</TableHead>
                                    <TableHead className="text-right">
                                        Salario Base
                                    </TableHead>
                                    <TableHead className="text-right">
                                        ISR
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lista.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground py-8"
                                        >
                                            No hay retenciones de ISR en este
                                            período
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    lista.map((f, i) => (
                                        <TableRow
                                            key={`${f.CodigoEmpleado}-${i}`}
                                        >
                                            <TableCell className="font-mono text-xs">
                                                {f.CodigoEmpleado}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {f.Empleado}
                                            </TableCell>
                                            <TableCell>
                                                {f.Departamento}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs">
                                                {formatMoneda(f.SalarioBase)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs">
                                                {formatMoneda(f.MontoISR)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {lista.length > 0 && (
                            <div className="flex justify-end border-t pt-4">
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">
                                        Total ISR
                                    </p>
                                    <p className="text-xl font-semibold">
                                        {formatMoneda(total)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
