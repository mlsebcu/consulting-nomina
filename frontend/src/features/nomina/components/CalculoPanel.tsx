import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
    Calculator,
    CheckCircle2Icon,
    CircleIcon,
    ClipboardListIcon,
    HandCoinsIcon,
    LockIcon,
    type LucideIcon,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EstadoBadge } from "@/components/EstadoBadge";
import { PeriodoSelect } from "@/components/PeriodoSelect";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { mensajeError } from "@/utils/errores";
import { rangoPeriodo } from "@/utils/periodos";
import type { Periodo } from "../../periodos/Periodos.types";
import { nominaApi } from "../Nomina.api";

type Accion = "anticipo" | "finmes" | "cerrar";

const CONFIRMACIONES: Record<Accion, { titulo: string; descripcion: string; boton: string }> = {
    anticipo: {
        titulo: "Calcular anticipo del día 15",
        descripcion:
            "Se pagará el porcentaje de anticipo configurado sobre el salario base de cada empleado activo. Si ya existía un anticipo para este período, se reemplaza.",
        boton: "Calcular anticipo",
    },
    finmes: {
        titulo: "Calcular nómina de fin de mes",
        descripcion:
            "Se calcularán salario, bonificación decreto, novedades, IGSS, ISR y provisiones, descontando el anticipo del mes. Puede recalcular las veces que necesite mientras el período esté abierto.",
        boton: "Calcular nómina",
    },
    cerrar: {
        titulo: "Cerrar período",
        descripcion:
            "Después del cierre no se podrán modificar novedades ni recalcular la nómina. Verifique los reportes antes de continuar.",
        boton: "Cerrar período",
    },
};

interface Props {
    periodo: Periodo | null;
    resumen: { anticipos: number; finMes: number };
    onPeriodoChange: (periodo: Periodo) => void;
    onProcesado: () => void;
}

function Paso({
    numero,
    titulo,
    descripcion,
    icono: Icono,
    completado,
    children,
}: {
    numero: number;
    titulo: string;
    descripcion: string;
    icono: LucideIcon;
    completado: boolean;
    children: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3 rounded-lg border p-4",
                completado && "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30",
            )}
        >
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                {completado ? (
                    <CheckCircle2Icon className="size-4 text-emerald-600" />
                ) : (
                    <CircleIcon className="size-4" />
                )}
                Paso {numero}
            </div>
            <div className="flex items-start gap-2">
                <Icono className="mt-0.5 size-4 shrink-0" />
                <div>
                    <p className="text-sm font-semibold">{titulo}</p>
                    <p className="text-xs text-muted-foreground">{descripcion}</p>
                </div>
            </div>
            <div className="mt-auto">{children}</div>
        </div>
    );
}

export function CalculoPanel({ periodo, resumen, onPeriodoChange, onProcesado }: Props) {
    const { esAdmin } = useAuth();
    const [confirmar, setConfirmar] = useState<Accion | null>(null);
    const [procesando, setProcesando] = useState(false);
    const [recargarPeriodos, setRecargarPeriodos] = useState(0);

    const cerrado = periodo?.estado === "CERRADO";
    const deshabilitado = !periodo || cerrado || procesando;

    async function ejecutar() {
        if (!periodo || !confirmar) return;
        setProcesando(true);
        try {
            const operaciones: Record<Accion, (id: number) => ReturnType<typeof nominaApi.calcularNomina>> = {
                anticipo: nominaApi.calcularAnticipo,
                finmes: nominaApi.calcularNomina,
                cerrar: nominaApi.cerrarNomina,
            };
            const resultado = await operaciones[confirmar](periodo.periodoId);
            toast.success(resultado.mensaje, {
                description: `${resultado.totalNominas} empleado(s) procesados`,
            });
            setConfirmar(null);
            if (confirmar === "cerrar") setRecargarPeriodos((n) => n + 1);
            onProcesado();
        } catch (err) {
            toast.error(mensajeError(err, "No se pudo completar el proceso."));
        } finally {
            setProcesando(false);
        }
    }

    const accion = confirmar ? CONFIRMACIONES[confirmar] : null;

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1.5">
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="size-5" />
                        Proceso de nómina
                    </CardTitle>
                    <CardDescription>
                        {periodo ? (
                            <span className="flex flex-wrap items-center gap-2">
                                {rangoPeriodo(periodo)}
                                <EstadoBadge estado={periodo.estado} />
                            </span>
                        ) : (
                            "Seleccione el período a procesar."
                        )}
                    </CardDescription>
                </div>
                <PeriodoSelect
                    value={periodo?.periodoId ?? null}
                    onChange={onPeriodoChange}
                    recargar={recargarPeriodos}
                    seleccionarPrimero
                />
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Paso
                        numero={1}
                        titulo="Novedades"
                        descripcion="Horas extras, comisiones, bonificaciones y descuentos."
                        icono={ClipboardListIcon}
                        completado={false}
                    >
                        <Button
                            variant="outline"
                            className="w-full"
                            render={<Link to="/novedades" />}
                            nativeButton={false}
                        >
                            Revisar novedades
                        </Button>
                    </Paso>
                    <Paso
                        numero={2}
                        titulo="Anticipo día 15"
                        descripcion={
                            resumen.anticipos
                                ? `${resumen.anticipos} empleado(s) con anticipo`
                                : "Pago parcial sobre el salario base."
                        }
                        icono={HandCoinsIcon}
                        completado={resumen.anticipos > 0}
                    >
                        <Button
                            variant="outline"
                            className="w-full"
                            disabled={deshabilitado || resumen.finMes > 0}
                            onClick={() => setConfirmar("anticipo")}
                        >
                            {resumen.anticipos ? "Recalcular anticipo" : "Calcular anticipo"}
                        </Button>
                    </Paso>
                    <Paso
                        numero={3}
                        titulo="Fin de mes"
                        descripcion={
                            resumen.finMes
                                ? `${resumen.finMes} empleado(s) calculados`
                                : "Ingresos, descuentos de ley y provisiones."
                        }
                        icono={Calculator}
                        completado={resumen.finMes > 0}
                    >
                        <Button
                            className="w-full"
                            disabled={deshabilitado}
                            onClick={() => setConfirmar("finmes")}
                        >
                            {resumen.finMes ? "Recalcular nómina" : "Calcular nómina"}
                        </Button>
                    </Paso>
                    <Paso
                        numero={4}
                        titulo="Cierre"
                        descripcion={
                            esAdmin
                                ? "Bloquea el período para auditoría."
                                : "Solo un administrador puede cerrar el período."
                        }
                        icono={LockIcon}
                        completado={cerrado}
                    >
                        <Button
                            variant="destructive"
                            className="w-full"
                            disabled={deshabilitado || !esAdmin || resumen.finMes === 0}
                            onClick={() => setConfirmar("cerrar")}
                        >
                            Cerrar período
                        </Button>
                    </Paso>
                </div>
            </CardContent>

            <ConfirmDialog
                open={!!accion}
                titulo={accion?.titulo ?? ""}
                descripcion={accion?.descripcion}
                textoConfirmar={accion?.boton}
                destructivo={confirmar === "cerrar"}
                procesando={procesando}
                onConfirmar={ejecutar}
                onCancelar={() => setConfirmar(null)}
            />
        </Card>
    );
}
