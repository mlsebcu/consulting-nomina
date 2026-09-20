import { useEffect, useState } from "react";
import type { FilaPoliza } from "../Reportes.types";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, BookOpen } from "lucide-react";
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

export function ReportePoliza() {
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [periodoId, setPeriodoId] = useState<number | null>(null);
    const [lista, setLista] = useState<FilaPoliza[]>([]);
    const [totales, setTotales] = useState({
        debe: 0,
        haber: 0,
        cuadra: false,
    });
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
            const data = await reportesApi.poliza(periodoId);
            setLista(data.lista);
            setTotales(data.totales);
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
                    <BookOpen className="h-5 w-5" />
                    Póliza Contable
                </CardTitle>
                <CardDescription>
                    Asiento contable de nómina agrupado por cuenta.
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
                                    <TableHead>Cuenta</TableHead>
                                    <TableHead>Departamento</TableHead>
                                    <TableHead>Movimiento</TableHead>
                                    <TableHead>Concepto</TableHead>
                                    <TableHead className="text-right">
                                        Debe
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Haber
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lista.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground py-8"
                                        >
                                            No hay movimientos contables en este
                                            período
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    lista.map((f, i) => (
                                        <TableRow
                                            key={`${f.CuentaContable}-${f.Concepto}-${i}`}
                                        >
                                            <TableCell className="font-mono text-xs">
                                                {f.CuentaContable}
                                            </TableCell>
                                            <TableCell>
                                                {f.Departamento}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        f.TipoMovimiento ===
                                                        "DEBE"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-amber-100 text-amber-800"
                                                    }
                                                >
                                                    {f.TipoMovimiento}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{f.Concepto}</TableCell>
                                            <TableCell className="text-right font-mono text-xs">
                                                {f.Debe > 0
                                                    ? formatMoneda(f.Debe)
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs">
                                                {f.Haber > 0
                                                    ? formatMoneda(f.Haber)
                                                    : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {lista.length > 0 && (
                            <div className="border-t pt-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {totales.cuadra ? (
                                        <Badge className="bg-green-100 text-green-800">
                                            Póliza cuadrada ✓
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-100 text-red-800">
                                            Póliza descuadrada
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex gap-8 text-right">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Total Debe
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {formatMoneda(totales.debe)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Total Haber
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {formatMoneda(totales.haber)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
