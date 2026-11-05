import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { PeriodoSelect } from "@/components/PeriodoSelect";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatMoneda } from "@/utils/formatters";
import { reportesApi } from "../Reportes.api";
import type { FilaLibroSalarios, TotalDepartamento } from "../Reportes.types";
import { ReporteCard, useReporte } from "./ReporteCard";

const COLUMNAS = 7;

function FilaTotal({ total }: { total: TotalDepartamento }) {
    return (
        <TableRow className="bg-muted/50 font-medium">
            <TableCell colSpan={3}>
                Total {total.departamento} ({total.totalEmpleados})
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatMoneda(total.totalIngresos)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatMoneda(total.totalEgresos)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatMoneda(total.totalAnticipo)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatMoneda(total.totalLiquido)}</TableCell>
        </TableRow>
    );
}

export function ReporteLibroSalarios() {
    const [periodoId, setPeriodoId] = useState<number | null>(null);
    const { datos, cargando, error } = useReporte(
        periodoId ? () => reportesApi.libroSalarios(periodoId) : null,
        periodoId,
    );
    const lista = datos?.lista ?? [];
    const totales = datos?.totales ?? [];

    const porDepartamento = new Map<string, FilaLibroSalarios[]>();
    for (const fila of lista) {
        porDepartamento.set(fila.departamento, [...(porDepartamento.get(fila.departamento) ?? []), fila]);
    }

    const general = totales.reduce(
        (acc, t) => ({
            ingresos: acc.ingresos + t.totalIngresos,
            egresos: acc.egresos + t.totalEgresos,
            anticipo: acc.anticipo + t.totalAnticipo,
            liquido: acc.liquido + t.totalLiquido,
        }),
        { ingresos: 0, egresos: 0, anticipo: 0, liquido: 0 },
    );

    return (
        <ReporteCard
            titulo="Libro de salarios"
            descripcion="Departamento, empleado, sueldo base, días laborados, ingresos y egresos del período."
            icono={FileSpreadsheet}
            cargando={cargando}
            error={error}
            hayDatos={lista.length > 0}
            filtros={
                <PeriodoSelect
                    value={periodoId}
                    onChange={(p) => setPeriodoId(p.periodoId)}
                    seleccionarPrimero
                />
            }
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Empleado</TableHead>
                        <TableHead className="text-right">Sueldo base</TableHead>
                        <TableHead className="text-right">Días lab.</TableHead>
                        <TableHead className="text-right">Ingresos</TableHead>
                        <TableHead className="text-right">Egresos</TableHead>
                        <TableHead className="text-right">Anticipo</TableHead>
                        <TableHead className="text-right">Líquido</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lista.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={COLUMNAS} className="py-8 text-center text-muted-foreground">
                                No hay datos. Calcule la nómina de fin de mes del período.
                            </TableCell>
                        </TableRow>
                    ) : (
                        [...porDepartamento.entries()].flatMap(([departamento, filas]) => {
                            const total = totales.find((t) => t.departamento === departamento);
                            return [
                                <TableRow key={`dep-${departamento}`}>
                                    <TableCell
                                        colSpan={COLUMNAS}
                                        className="pt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                    >
                                        {departamento}
                                    </TableCell>
                                </TableRow>,
                                ...filas.map((f) => (
                                    <TableRow key={f.codigoEmpleado}>
                                        <TableCell className="font-medium">
                                            {f.empleado}
                                            <span className="block text-xs font-normal text-muted-foreground">
                                                {f.codigoEmpleado} · {f.puesto}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatMoneda(f.salarioBase)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">{f.diasLaborados}</TableCell>
                                        <TableCell className="text-right tabular-nums">{formatMoneda(f.ingresos)}</TableCell>
                                        <TableCell className="text-right tabular-nums">{formatMoneda(f.egresos)}</TableCell>
                                        <TableCell className="text-right tabular-nums">{formatMoneda(f.anticipo)}</TableCell>
                                        <TableCell className="text-right font-semibold tabular-nums">
                                            {formatMoneda(f.liquido)}
                                        </TableCell>
                                    </TableRow>
                                )),
                                total && <FilaTotal key={`tot-${departamento}`} total={total} />,
                            ];
                        })
                    )}
                </TableBody>
                {lista.length > 0 && (
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3}>Total general ({lista.length} empleados)</TableCell>
                            <TableCell className="text-right tabular-nums">{formatMoneda(general.ingresos)}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatMoneda(general.egresos)}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatMoneda(general.anticipo)}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatMoneda(general.liquido)}</TableCell>
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </ReporteCard>
    );
}
