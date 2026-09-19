import { useEffect, useState } from "react";
import type { NominaEmpleado } from "../Nomina.types";
import { nominaApi } from "../Nomina.api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { formatMoneda, formatFecha } from "@/utils/formatters";

interface Props {
    nominaId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NominaDetalleDialog({ nominaId, open, onOpenChange }: Props) {
    const [nomina, setNomina] = useState<NominaEmpleado | null>(null);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (open && nominaId) {
            cargar();
        } else {
            setNomina(null);
        }
    }, [open, nominaId]);

    async function cargar() {
        if (!nominaId) return;
        setCargando(true);
        try {
            setNomina(await nominaApi.obtenerUna(nominaId));
        } catch {
            setNomina(null);
        } finally {
            setCargando(false);
        }
    }

    function colorNaturaleza(codigo: string) {
        switch (codigo) {
            case "PERCEPCION":
                return "bg-green-100 text-green-800 hover:bg-green-100";
            case "DEDUCCION":
                return "bg-red-100 text-red-800 hover:bg-red-100";
            case "PROVISION":
                return "bg-blue-100 text-blue-800 hover:bg-blue-100";
            default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-100";
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalle de Nómina</DialogTitle>
                    <DialogDescription>
                        Recibo detallado con cada concepto aplicado.
                    </DialogDescription>
                </DialogHeader>

                {cargando ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : !nomina ? (
                    <div className="text-center text-muted-foreground py-8">
                        No se pudo cargar la nómina.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Cabecera */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    Empleado
                                </p>
                                <p className="font-medium">
                                    {nomina.empleado
                                        ? `${nomina.empleado.nombres} ${nomina.empleado.apellidos}`
                                        : `#${nomina.empleadoId}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {nomina.empleado?.codigoEmpleado} —{" "}
                                    {nomina.empleado?.puesto}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Período</p>
                                <p className="font-medium">
                                    {nomina.periodo
                                        ? `#${nomina.periodo.numeroPeriodo} — ${nomina.periodo.anio}`
                                        : `#${nomina.periodoId}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {nomina.tipoNomina} —{" "}
                                    {nomina.periodo
                                        ? `${formatFecha(nomina.periodo.fechaInicio)} → ${formatFecha(nomina.periodo.fechaFin)}`
                                        : "-"}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Totales */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    Percepciones
                                </p>
                                <p className="font-semibold text-green-700">
                                    {formatMoneda(nomina.totalPercepciones)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Deducciones
                                </p>
                                <p className="font-semibold text-red-700">
                                    {formatMoneda(nomina.totalDeducciones)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Provisiones
                                </p>
                                <p className="font-semibold text-blue-700">
                                    {formatMoneda(nomina.totalProvisiones)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Líquido</p>
                                <p className="font-semibold text-lg">
                                    {formatMoneda(nomina.liquido)}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Detalle por concepto */}
                        <div>
                            <h4 className="text-sm font-semibold mb-2">
                                Conceptos aplicados
                            </h4>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Concepto</TableHead>
                                        <TableHead>Naturaleza</TableHead>
                                        <TableHead className="text-right">
                                            Monto
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!nomina.detalles ||
                                    nomina.detalles.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center text-muted-foreground py-4"
                                            >
                                                No hay conceptos registrados
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        nomina.detalles.map((d) => (
                                            <TableRow key={d.nominaDetalleId}>
                                                <TableCell className="font-mono text-xs">
                                                    {d.conceptoCodigo}
                                                </TableCell>
                                                <TableCell>
                                                    {d.conceptoNombre}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={colorNaturaleza(
                                                            d.naturalezaCodigo,
                                                        )}
                                                    >
                                                        {d.naturalezaCodigo}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    {formatMoneda(d.monto)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {nomina.anticipo > 0 && (
                            <>
                                <Separator />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        Anticipo descontado
                                    </span>
                                    <span className="font-mono font-semibold text-red-700">
                                        -{formatMoneda(nomina.anticipo)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
