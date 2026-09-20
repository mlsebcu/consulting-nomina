import { useState } from "react";
import type { Cumpleaniero } from "../Reportes.types";
import { reportesApi } from "../Reportes.api";
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
import { Loader2, Search, Cake } from "lucide-react";

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

export function ReporteCumpleanieros() {
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [lista, setLista] = useState<Cumpleaniero[]>([]);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const [buscado, setBuscado] = useState(false);

    async function generar() {
        setError("");
        setCargando(true);
        try {
            const data = await reportesApi.cumpleanieros(mes);
            setLista(data.lista);
            setBuscado(true);
        } catch {
            setError("No se pudo generar el reporte.");
            setLista([]);
        } finally {
            setCargando(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Cake className="h-5 w-5" />
                    Cumpleañeros del mes
                </CardTitle>
                <CardDescription>
                    Listado de empleados activos que cumplen años en el mes
                    seleccionado.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-end gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="mes">Mes</Label>
                        <Select
                            value={String(mes)}
                            onValueChange={(v) => v && setMes(Number(v))}
                        >
                            <SelectTrigger id="mes" className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MESES.map((m, i) => (
                                    <SelectItem
                                        key={i + 1}
                                        value={String(i + 1)}
                                    >
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={generar} disabled={cargando}>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Empleado</TableHead>
                                <TableHead>Departamento</TableHead>
                                <TableHead>Puesto</TableHead>
                                <TableHead>Cumpleaños</TableHead>
                                <TableHead>Edad</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lista.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-muted-foreground py-8"
                                    >
                                        No hay cumpleañeros en {MESES[mes - 1]}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lista.map((c) => (
                                    <TableRow key={c.EmpleadoId}>
                                        <TableCell className="font-mono text-xs">
                                            {c.CodigoEmpleado}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {c.Empleado}
                                        </TableCell>
                                        <TableCell>{c.Departamento}</TableCell>
                                        <TableCell>{c.Puesto}</TableCell>
                                        <TableCell>
                                            {c.Dia} de {c.MesNacimiento}
                                        </TableCell>
                                        <TableCell>{c.Edad} años</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
