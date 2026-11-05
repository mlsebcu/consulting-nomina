import { useState } from "react";
import { BookOpenCheck, CheckCircle2Icon, TriangleAlertIcon } from "lucide-react";
import { PeriodoSelect } from "@/components/PeriodoSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { ReporteCard, useReporte } from "./ReporteCard";

export function ReportePoliza() {
    const [periodoId, setPeriodoId] = useState<number | null>(null);
    const { datos, cargando, error } = useReporte(
        periodoId ? () => reportesApi.poliza(periodoId) : null,
        periodoId,
    );
    const lista = datos?.lista ?? [];
    const totales = datos?.totales;

    return (
        <ReporteCard
            titulo="Póliza de contabilidad"
            descripcion="Partida de la nómina de fin de mes: gasto por departamento contra retenciones, anticipos y sueldos por pagar."
            icono={BookOpenCheck}
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
            {totales && lista.length > 0 && (
                <Alert variant={totales.cuadra ? "default" : "destructive"}>
                    {totales.cuadra ? <CheckCircle2Icon /> : <TriangleAlertIcon />}
                    <AlertDescription>
                        {totales.cuadra
                            ? "La partida cuadra: el total del debe es igual al total del haber."
                            : `La partida no cuadra por ${formatMoneda(Math.abs(totales.debe - totales.haber))}. Revise que todos los conceptos de descuento tengan cuenta contable.`}
                    </AlertDescription>
                </Alert>
            )}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cuenta</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead className="text-right">Debe</TableHead>
                        <TableHead className="text-right">Haber</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lista.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                No hay movimientos. Calcule la nómina de fin de mes del período.
                            </TableCell>
                        </TableRow>
                    ) : (
                        lista.map((f) => (
                            <TableRow key={`${f.tipoMovimiento}-${f.cuentaContable}-${f.departamento}`}>
                                <TableCell className="font-mono text-xs">{f.cuentaContable}</TableCell>
                                <TableCell className={f.tipoMovimiento === "HABER" ? "pl-8" : ""}>
                                    {f.concepto}
                                </TableCell>
                                <TableCell>{f.departamento}</TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {f.debe ? formatMoneda(f.debe) : ""}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {f.haber ? formatMoneda(f.haber) : ""}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
                {totales && lista.length > 0 && (
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3}>Totales</TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatMoneda(totales.debe)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatMoneda(totales.haber)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </ReporteCard>
    );
}
