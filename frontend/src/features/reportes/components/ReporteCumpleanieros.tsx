import { useState } from "react";
import { Cake } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { MESES } from "@/utils/periodos";
import { reportesApi } from "../Reportes.api";
import { ReporteCard, useReporte } from "./ReporteCard";

const OPCIONES_MES = Object.fromEntries(MESES.map((m, i) => [String(i + 1), m]));

export function ReporteCumpleanieros() {
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const { datos, cargando, error } = useReporte(() => reportesApi.cumpleanieros(mes), mes);
    const lista = datos?.lista ?? [];

    return (
        <ReporteCard
            titulo="Cumpleañeros del mes"
            descripcion="Empleados activos que cumplen años en el mes seleccionado."
            icono={Cake}
            cargando={cargando}
            error={error}
            hayDatos={lista.length > 0}
            filtros={
                <div className="grid gap-2">
                    <Label htmlFor="mes">Mes</Label>
                    <Select
                        items={OPCIONES_MES}
                        value={String(mes)}
                        onValueChange={(v) => v && setMes(Number(v))}
                    >
                        <SelectTrigger id="mes" className="w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(OPCIONES_MES).map(([valor, nombre]) => (
                                <SelectItem key={valor} value={valor}>
                                    {nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            }
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16 text-center">Día</TableHead>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Puesto</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead className="text-right">Cumple</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lista.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                Ningún empleado cumple años en {MESES[mes - 1]}
                            </TableCell>
                        </TableRow>
                    ) : (
                        lista.map((c) => (
                            <TableRow key={c.empleadoId}>
                                <TableCell className="text-center text-lg font-semibold tabular-nums">
                                    {c.dia}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {c.empleado}
                                    <span className="block font-mono text-xs text-muted-foreground">
                                        {c.codigoEmpleado}
                                    </span>
                                </TableCell>
                                <TableCell>{c.departamento}</TableCell>
                                <TableCell>{c.puesto}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {c.correoCorporativo}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {c.edad} años
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </ReporteCard>
    );
}
