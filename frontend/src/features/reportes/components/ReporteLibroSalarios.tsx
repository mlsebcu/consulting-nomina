import { useEffect, useState } from "react";
import type { FilaLibroSalarios, TotalLibroSalarios } from "../Reportes.types";
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
import { Loader2, Search, FileSpreadsheet } from "lucide-react";
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

export function ReporteLibroSalarios() {
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [periodoId, setPeriodoId] = useState<number | null>(null);
    const [lista, setLista] = useState<FilaLibroSalarios[]>([]);
    const [totales, setTotales] = useState<TotalLibroSalarios[]>([]);
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
            const data = await reportesApi.libroSalarios(periodoId);
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
                    <FileSpreadsheet className="h-5 w-5" />
                    Libro de Salarios
                </CardTitle>
                <CardDescription>
                    Detalle de salarios por empleado y totales por departamento.
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
                        <div>
                            <h3 className="text-sm font-semibold mb-2">
                                Detalle por empleado
                            </h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Depto.</TableHead>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Empleado</TableHead>
                                        <TableHead className="text-right">
                                            Salario Base
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Días
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Ingresos
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Egresos
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Líquido
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lista.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                No hay datos para este período
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        lista.map((f, i) => (
                                            <TableRow
                                                key={`${f.CodigoEmpleado}-${i}`}
                                            >
                                                <TableCell>
                                                    {f.Departamento}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {f.CodigoEmpleado}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {f.Empleado}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs">
                                                    {formatMoneda(
                                                        f.SalarioBase,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {f.DiasLaborados}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs text-green-700">
                                                    {formatMoneda(f.Ingresos)}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs text-red-700">
                                                    {formatMoneda(f.Egresos)}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs font-semibold">
                                                    {formatMoneda(f.Liquido)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {totales.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2 mt-6">
                                    Totales por departamento
                                </h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Departamento</TableHead>
                                            <TableHead className="text-right">
                                                Empleados
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Ingresos
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Egresos
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Provisiones
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Anticipo
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Líquido
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {totales.map((t) => (
                                            <TableRow key={t.Departamento}>
                                                <TableCell className="font-medium">
                                                    {t.Departamento}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {t.TotalEmpleados}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs">
                                                    {formatMoneda(
                                                        t.TotalIngresos,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs">
                                                    {formatMoneda(
                                                        t.TotalEgresos,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs">
                                                    {formatMoneda(
                                                        t.TotalProvisiones,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs">
                                                    {formatMoneda(
                                                        t.TotalAnticipo,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs font-semibold">
                                                    {formatMoneda(
                                                        t.TotalLiquido,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
