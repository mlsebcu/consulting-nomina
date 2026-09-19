import { useEffect, useState } from "react";
import type { Periodo } from "../../periodos/Periodos.types";
import { periodosApi } from "../../periodos/Periodos.api";
import { nominaApi } from "../Nomina.api";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Lock, Loader2, CalendarDays } from "lucide-react";
import { formatFecha } from "@/utils/formatters";

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

interface Props {
    onCalculo: (periodoId: number) => void;
}

export function CalculoPanel({ onCalculo }: Props) {
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [periodoId, setPeriodoId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const [accion, setAccion] = useState<
        "anticipo" | "nomina" | "cerrar" | null
    >(null);
    const [confirmar, setConfirmar] = useState<
        "anticipo" | "nomina" | "cerrar" | null
    >(null);

    async function cargar() {
        setCargando(true);
        try {
            const data = await periodosApi.getAbiertos();
            setPeriodos(data);
            if (data.length > 0 && !periodoId) {
                setPeriodoId(data[0].periodoId);
            }
        } catch {
            setError("No se pudieron cargar los períodos.");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargar();
    }, []);

    const periodoSeleccionado = periodos.find((p) => p.periodoId === periodoId);

    async function ejecutar(accion: "anticipo" | "nomina" | "cerrar") {
        if (!periodoId) return;
        setError("");
        setAccion(accion);
        setConfirmar(null);
        try {
            if (accion === "anticipo") {
                await nominaApi.calcularAnticipo({ periodoId });
            } else if (accion === "nomina") {
                await nominaApi.calcularNomina({ periodoId });
            } else {
                await nominaApi.cerrarNomina({ periodoId });
            }
            onCalculo(periodoId);
            await cargar();
        } catch (err: unknown) {
            const axiosError = err as {
                response?: { data?: { message?: string | string[] } };
            };
            const mensaje = axiosError.response?.data?.message;
            setError(
                Array.isArray(mensaje)
                    ? mensaje.join(", ")
                    : (mensaje ?? "No se pudo ejecutar la acción."),
            );
        } finally {
            setAccion(null);
        }
    }

    function nombrePeriodo(p: Periodo) {
        return `${MESES[p.mes - 1]} ${p.anio} — ${
            p.tipoPeriodo === "QUINCENAL"
                ? `${p.quincena}ª quincena`
                : "Mensual"
        } (${formatFecha(p.fechaInicio)} → ${formatFecha(p.fechaFin)})`;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Cálculo de Nómina
                </CardTitle>
                <CardDescription>
                    Seleccione un período y ejecute el cálculo correspondiente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label
                        htmlFor="periodoId"
                        className="flex items-center gap-2"
                    >
                        <CalendarDays className="h-4 w-4" />
                        Período
                    </Label>
                    <Select
                        value={periodoId ? String(periodoId) : undefined}
                        onValueChange={(v) => v && setPeriodoId(Number(v))}
                        disabled={cargando || periodos.length === 0}
                    >
                        <SelectTrigger id="periodoId">
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
                    {periodos.length === 0 && !cargando && (
                        <p className="text-sm text-muted-foreground">
                            No hay períodos abiertos. Cree uno en la sección de
                            Períodos.
                        </p>
                    )}
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => setConfirmar("anticipo")}
                        disabled={!periodoId || accion !== null}
                        variant="outline"
                    >
                        {accion === "anticipo" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Calculator className="mr-2 h-4 w-4" />
                        )}
                        Calcular anticipo
                    </Button>

                    <Button
                        onClick={() => setConfirmar("nomina")}
                        disabled={!periodoId || accion !== null}
                    >
                        {accion === "nomina" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Calculator className="mr-2 h-4 w-4" />
                        )}
                        Calcular nómina fin de mes
                    </Button>

                    <Button
                        onClick={() => setConfirmar("cerrar")}
                        disabled={!periodoId || accion !== null}
                        variant="destructive"
                    >
                        {accion === "cerrar" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Lock className="mr-2 h-4 w-4" />
                        )}
                        Cerrar nómina
                    </Button>
                </div>

                {periodoSeleccionado && (
                    <p className="text-xs text-muted-foreground">
                        Período seleccionado:{" "}
                        <strong>#{periodoSeleccionado.numeroPeriodo}</strong> —
                        Estado: {periodoSeleccionado.estado}
                    </p>
                )}
            </CardContent>

            <Dialog
                open={!!confirmar}
                onOpenChange={(open) => !open && setConfirmar(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {confirmar === "anticipo" && "Calcular anticipo"}
                            {confirmar === "nomina" &&
                                "Calcular nómina fin de mes"}
                            {confirmar === "cerrar" && "Cerrar nómina"}
                        </DialogTitle>
                        <DialogDescription>
                            {confirmar === "anticipo" &&
                                "Se calculará el 50% del salario base para todos los empleados activos en el período seleccionado."}
                            {confirmar === "nomina" &&
                                "Se calculará la nómina de fin de mes con percepciones, deducciones y provisiones."}
                            {confirmar === "cerrar" &&
                                "Se cerrará el período. No se podrá modificar ni recalcular la nómina después de esto."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmar(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant={
                                confirmar === "cerrar"
                                    ? "destructive"
                                    : "default"
                            }
                            onClick={() => confirmar && ejecutar(confirmar)}
                        >
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
