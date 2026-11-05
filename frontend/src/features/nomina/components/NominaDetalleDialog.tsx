import { useEffect, useState } from "react";
import { Loader2, PrinterIcon } from "lucide-react";
import { EstadoBadge } from "@/components/EstadoBadge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatMoneda } from "@/utils/formatters";
import { nombrePeriodo, rangoPeriodo } from "@/utils/periodos";
import { nominaApi } from "../Nomina.api";
import type { NominaDetalle, NominaEmpleado } from "../Nomina.types";

interface Props {
    nominaId: number | null;
    onOpenChange: (open: boolean) => void;
}

function Lineas({ titulo, lineas, total }: { titulo: string; lineas: NominaDetalle[]; total: number }) {
    return (
        <div className="space-y-2">
            <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{titulo}</h4>
            {lineas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin movimientos</p>
            ) : (
                <ul className="space-y-1 text-sm">
                    {lineas.map((l) => (
                        <li key={l.nominaDetalleId} className="flex justify-between gap-4">
                            <span>
                                {l.conceptoNombre}
                                {l.cantidad !== null && (
                                    <span className="text-muted-foreground"> ({l.cantidad} h)</span>
                                )}
                            </span>
                            <span className="tabular-nums">{formatMoneda(l.monto)}</span>
                        </li>
                    ))}
                </ul>
            )}
            <Separator />
            <div className="flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatMoneda(total)}</span>
            </div>
        </div>
    );
}

export function NominaDetalleDialog({ nominaId, onOpenChange }: Props) {
    const [nomina, setNomina] = useState<NominaEmpleado | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!nominaId) return;
        let vigente = true;
        setNomina(null);
        setError(false);
        nominaApi
            .obtenerUna(nominaId)
            .then((data) => vigente && setNomina(data))
            .catch(() => vigente && setError(true));
        return () => {
            vigente = false;
        };
    }, [nominaId]);

    const detalles = nomina?.detalles ?? [];
    const porNaturaleza = (codigo: string) => detalles.filter((d) => d.naturalezaCodigo === codigo);
    const esAnticipo = nomina?.tipoNomina === "ANTICIPO";

    return (
        <Dialog open={!!nominaId} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Recibo de pago</DialogTitle>
                    <DialogDescription>
                        {nomina?.periodo
                            ? `${esAnticipo ? "Anticipo" : "Nómina de fin de mes"}, ${nombrePeriodo(nomina.periodo)}`
                            : "Detalle de conceptos aplicados al empleado."}
                    </DialogDescription>
                </DialogHeader>

                {error ? (
                    <p className="py-8 text-center text-muted-foreground">No se pudo cargar el recibo.</p>
                ) : !nomina ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-4 rounded-lg bg-muted/50 p-4 text-sm sm:grid-cols-2">
                            <div>
                                <p className="font-semibold">
                                    {nomina.empleado?.nombres} {nomina.empleado?.apellidos}
                                </p>
                                <p className="text-muted-foreground">
                                    {nomina.empleado?.codigoEmpleado} · {nomina.empleado?.puesto}
                                </p>
                                <p className="text-muted-foreground">{nomina.empleado?.departamento?.nombre}</p>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-muted-foreground">
                                    {nomina.periodo && rangoPeriodo(nomina.periodo)}
                                </p>
                                <p className="text-muted-foreground">Días laborados: {nomina.diasLaborados}</p>
                                <EstadoBadge estado={nomina.estado} className="mt-1" />
                            </div>
                        </div>

                        {esAnticipo ? (
                            <Lineas titulo="Anticipo" lineas={detalles} total={nomina.liquido} />
                        ) : (
                            <>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <Lineas
                                        titulo="Ingresos"
                                        lineas={porNaturaleza("PERCEPCION")}
                                        total={nomina.totalPercepciones}
                                    />
                                    <Lineas
                                        titulo="Descuentos"
                                        lineas={porNaturaleza("DEDUCCION")}
                                        total={nomina.totalDeducciones}
                                    />
                                </div>

                                <div className="space-y-1 rounded-lg border p-4 text-sm">
                                    <div className="flex justify-between">
                                        <span>Ingresos menos descuentos</span>
                                        <span className="tabular-nums">
                                            {formatMoneda(nomina.totalPercepciones - nomina.totalDeducciones)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Anticipo recibido el día 15</span>
                                        <span className="tabular-nums">- {formatMoneda(nomina.anticipo)}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-base font-semibold">
                                        <span>Líquido a recibir</span>
                                        <span className="tabular-nums">{formatMoneda(nomina.liquido)}</span>
                                    </div>
                                </div>

                                <Lineas
                                    titulo="Provisiones patronales (no afectan el líquido)"
                                    lineas={porNaturaleza("PROVISION")}
                                    total={nomina.totalProvisiones}
                                />
                            </>
                        )}
                    </div>
                )}

                <DialogFooter className="print:hidden">
                    <Button variant="outline" onClick={() => window.print()} disabled={!nomina}>
                        <PrinterIcon />
                        Imprimir
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
