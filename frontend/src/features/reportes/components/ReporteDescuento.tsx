import { useState } from "react";
import type { LucideIcon } from "lucide-react";
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
import type { ReporteDescuento as Reporte } from "../Reportes.types";
import { ReporteCard, useReporte } from "./ReporteCard";

interface Props {
    titulo: string;
    descripcion: string;
    icono: LucideIcon;
    columnaMonto: string;
    consultar: (periodoId: number) => Promise<Reporte>;
}

export function ReporteDescuento({ titulo, descripcion, icono, columnaMonto, consultar }: Props) {
    const [periodoId, setPeriodoId] = useState<number | null>(null);
    const { datos, cargando, error } = useReporte(
        periodoId ? () => consultar(periodoId) : null,
        periodoId,
    );
    const lista = datos?.lista ?? [];

    return (
        <ReporteCard
            titulo={titulo}
            descripcion={descripcion}
            icono={icono}
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
                        <TableHead>Código</TableHead>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead className="text-right">Salario base</TableHead>
                        <TableHead className="text-right">{columnaMonto}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lista.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                No hay descuentos en este período. Verifique que la nómina de fin de
                                mes esté calculada.
                            </TableCell>
                        </TableRow>
                    ) : (
                        lista.map((f) => (
                            <TableRow key={f.codigoEmpleado}>
                                <TableCell className="font-mono text-xs">{f.codigoEmpleado}</TableCell>
                                <TableCell className="font-medium">{f.empleado}</TableCell>
                                <TableCell>{f.departamento}</TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatMoneda(f.salarioBase)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatMoneda(f.monto)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
                {lista.length > 0 && (
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={4}>Total ({lista.length} empleados)</TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatMoneda(datos?.total)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </ReporteCard>
    );
}
