import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowRightIcon,
    Building2Icon,
    CakeIcon,
    CalendarClockIcon,
    Loader2,
    UsersIcon,
    WalletIcon,
    type LucideIcon,
} from "lucide-react";
import { EstadoBadge } from "@/components/EstadoBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { mensajeError } from "@/utils/errores";
import { formatMoneda } from "@/utils/formatters";
import { nombreMes, nombrePeriodo, rangoPeriodo } from "@/utils/periodos";
import { inicioApi, type ResumenInicio } from "./Inicio.api";

function Indicador({
    titulo,
    valor,
    detalle,
    icono: Icono,
}: {
    titulo: string;
    valor: ReactNode;
    detalle: ReactNode;
    icono: LucideIcon;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{titulo}</CardDescription>
                <Icono className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold tabular-nums">{valor}</div>
                <div className="mt-1 text-xs text-muted-foreground">{detalle}</div>
            </CardContent>
        </Card>
    );
}

function siguientePaso(resumen: ResumenInicio) {
    const { periodo, proceso } = resumen;
    if (!periodo || !proceso) {
        return { texto: "Crear el período del mes", url: "/periodos" };
    }
    if (proceso.anticipos === 0) {
        return { texto: "Calcular el anticipo del día 15", url: "/nomina" };
    }
    if (proceso.finMes === 0) {
        return { texto: "Revisar novedades y calcular el fin de mes", url: "/novedades" };
    }
    return { texto: "Revisar reportes y cerrar el período", url: "/reportes" };
}

function saludo() {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
}

export default function InicioPage() {
    const { usuario } = useAuth();
    const [resumen, setResumen] = useState<ResumenInicio | null>(null);

    useEffect(() => {
        inicioApi
            .resumen()
            .then(setResumen)
            .catch((err) => toast.error(mensajeError(err, "No se pudo cargar el resumen.")));
    }, []);

    if (!resumen) {
        return (
            <div className="flex flex-1 items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const { periodo, proceso, ultimaNomina, cumpleanieros } = resumen;
    const paso = siguientePaso(resumen);
    const hoy = new Date();
    const mesActual = nombreMes(hoy.getMonth() + 1);

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">
                    {saludo()}, {usuario?.nombreUsuario}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {hoy.toLocaleDateString("es-GT", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Indicador
                    titulo="Empleados activos"
                    valor={resumen.empleadosActivos}
                    detalle={`En ${resumen.departamentos} departamentos`}
                    icono={UsersIcon}
                />
                <Indicador
                    titulo="Período en curso"
                    valor={periodo ? nombreMes(periodo.mes) : "Sin período"}
                    detalle={
                        periodo ? (
                            <span className="flex items-center gap-2">
                                {rangoPeriodo(periodo)}
                                <EstadoBadge estado={periodo.estado} />
                            </span>
                        ) : (
                            "No hay períodos abiertos"
                        )
                    }
                    icono={CalendarClockIcon}
                />
                <Indicador
                    titulo="Líquido de la última nómina"
                    valor={ultimaNomina ? formatMoneda(ultimaNomina.totalLiquido) : "-"}
                    detalle={
                        ultimaNomina
                            ? `${nombreMes(ultimaNomina.mes)} ${ultimaNomina.anio}, ${ultimaNomina.empleados} empleados`
                            : "Aún no se ha calculado ninguna nómina"
                    }
                    icono={WalletIcon}
                />
                <Indicador
                    titulo="Cumpleañeros del mes"
                    valor={cumpleanieros.length}
                    detalle={mesActual}
                    icono={CakeIcon}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Avance de la nómina</CardTitle>
                        <CardDescription>
                            {periodo ? nombrePeriodo(periodo) : "Cree un período para iniciar el proceso."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {proceso && (
                            <ul className="grid gap-3 text-sm sm:grid-cols-3">
                                <li className="rounded-lg border p-3">
                                    <p className="text-muted-foreground">Novedades registradas</p>
                                    <p className="text-lg font-semibold tabular-nums">{proceso.novedades}</p>
                                </li>
                                <li className="rounded-lg border p-3">
                                    <p className="text-muted-foreground">Anticipos calculados</p>
                                    <p className="text-lg font-semibold tabular-nums">{proceso.anticipos}</p>
                                </li>
                                <li className="rounded-lg border p-3">
                                    <p className="text-muted-foreground">Fin de mes calculado</p>
                                    <p className="text-lg font-semibold tabular-nums">{proceso.finMes}</p>
                                </li>
                            </ul>
                        )}
                        <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Siguiente paso</p>
                                <p className="font-medium">{paso.texto}</p>
                            </div>
                            <Button render={<Link to={paso.url} />} nativeButton={false}>
                                Continuar
                                <ArrowRightIcon />
                            </Button>
                        </div>
                        {ultimaNomina && (
                            <div className="grid gap-2 text-sm sm:grid-cols-2">
                                <div className="flex justify-between rounded-lg border p-3">
                                    <span className="text-muted-foreground">Ingresos</span>
                                    <span className="tabular-nums">{formatMoneda(ultimaNomina.totalIngresos)}</span>
                                </div>
                                <div className="flex justify-between rounded-lg border p-3">
                                    <span className="text-muted-foreground">Descuentos</span>
                                    <span className="tabular-nums">{formatMoneda(ultimaNomina.totalDescuentos)}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CakeIcon className="size-5" />
                            Cumpleañeros de {mesActual}
                        </CardTitle>
                        <CardDescription>Empleados activos que cumplen años este mes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {cumpleanieros.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Nadie cumple años en {mesActual}.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {cumpleanieros.map((c) => {
                                    const esHoy = c.dia === hoy.getDate();
                                    const yaPaso = c.dia < hoy.getDate();
                                    return (
                                        <li key={c.empleadoId} className="flex items-center gap-3 py-2.5">
                                            <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-sm font-semibold tabular-nums">
                                                {c.dia}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className={`truncate font-medium ${yaPaso ? "text-muted-foreground" : ""}`}>
                                                    {c.empleado}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {c.departamento} · {c.edad} años
                                                </p>
                                            </div>
                                            {esHoy && <Badge>Hoy</Badge>}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 w-full"
                            render={<Link to="/empleados" />}
                            nativeButton={false}
                        >
                            <Building2Icon />
                            Ver empleados
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
