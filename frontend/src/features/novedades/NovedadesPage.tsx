import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, LockIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PeriodoSelect } from "@/components/PeriodoSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { mensajeError } from "@/utils/errores";
import { formatMoneda } from "@/utils/formatters";
import { empleadosApi } from "../empleados/Empleados.api";
import type { Empleado } from "../empleados/Empleados.types";
import type { Periodo } from "../periodos/Periodos.types";
import { novedadesApi } from "./Novedades.api";
import type { ConceptoCapturable, Novedad } from "./Novedades.types";

interface Formulario {
    empleadoId: string;
    conceptoId: string;
    valor: string;
    observacion: string;
}

const FORM_INICIAL: Formulario = { empleadoId: "", conceptoId: "", valor: "", observacion: "" };

export default function NovedadesPage() {
    const [periodo, setPeriodo] = useState<Periodo | null>(null);
    const [novedades, setNovedades] = useState<Novedad[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [conceptos, setConceptos] = useState<ConceptoCapturable[]>([]);
    const [form, setForm] = useState<Formulario>(FORM_INICIAL);
    const [editId, setEditId] = useState<number | null>(null);
    const [aEliminar, setAEliminar] = useState<Novedad | null>(null);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const cerrado = periodo?.estado === "CERRADO";
    const conceptoSeleccionado = conceptos.find((c) => String(c.conceptoId) === form.conceptoId);
    const capturaHoras = conceptoSeleccionado?.modoCaptura === "CANTIDAD";

    useEffect(() => {
        Promise.all([empleadosApi.getAll(), novedadesApi.conceptos()])
            .then(([e, c]) => {
                setEmpleados(e);
                setConceptos(c);
            })
            .catch((err) => toast.error(mensajeError(err, "No se pudieron cargar los catálogos.")));
    }, []);

    const cargarNovedades = useCallback(async (periodoId: number) => {
        setCargando(true);
        try {
            setNovedades(await novedadesApi.porPeriodo(periodoId));
        } catch (err) {
            toast.error(mensajeError(err, "No se pudieron cargar las novedades."));
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        if (periodo) void cargarNovedades(periodo.periodoId);
    }, [periodo, cargarNovedades]);

    const totales = useMemo(() => {
        let ingresos = 0;
        let descuentos = 0;
        for (const n of novedades) {
            if (n.monto === null) continue;
            if (n.concepto?.naturaleza?.codigo === "DEDUCCION") descuentos += n.monto;
            else ingresos += n.monto;
        }
        return { ingresos, descuentos };
    }, [novedades]);

    const opcionesEmpleado = Object.fromEntries(
        empleados.map((e) => [String(e.empleadoId), `${e.codigoEmpleado} ${e.nombres} ${e.apellidos}`]),
    );
    const opcionesConcepto = Object.fromEntries(
        conceptos.map((c) => [String(c.conceptoId), `${c.codigo} ${c.nombre}`]),
    );

    function abrirFormulario(novedad?: Novedad) {
        setEditId(novedad?.novedadId ?? null);
        setForm(
            novedad
                ? {
                      empleadoId: String(novedad.empleadoId),
                      conceptoId: String(novedad.conceptoId),
                      valor: String(novedad.cantidad ?? novedad.monto ?? ""),
                      observacion: novedad.observacion ?? "",
                  }
                : FORM_INICIAL,
        );
        setError("");
        setOpen(true);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!periodo || !conceptoSeleccionado || !form.empleadoId) {
            setError("Seleccione el empleado y el concepto.");
            return;
        }
        const valor = Number(form.valor);
        const datos = {
            conceptoId: conceptoSeleccionado.conceptoId,
            cantidad: capturaHoras ? valor : undefined,
            monto: capturaHoras ? undefined : valor,
            observacion: form.observacion.trim() || undefined,
        };

        setGuardando(true);
        setError("");
        try {
            if (editId) {
                await novedadesApi.update(editId, datos);
                toast.success("Novedad actualizada");
            } else {
                await novedadesApi.create({
                    ...datos,
                    empleadoId: Number(form.empleadoId),
                    periodoId: periodo.periodoId,
                });
                toast.success("Novedad registrada");
            }
            setOpen(false);
            await cargarNovedades(periodo.periodoId);
        } catch (err) {
            setError(mensajeError(err, "No se pudo guardar la novedad."));
        } finally {
            setGuardando(false);
        }
    }

    async function confirmarEliminar() {
        if (!aEliminar || !periodo) return;
        setGuardando(true);
        try {
            await novedadesApi.remove(aEliminar.novedadId);
            toast.success("Novedad eliminada");
            setAEliminar(null);
            await cargarNovedades(periodo.periodoId);
        } catch (err) {
            toast.error(mensajeError(err, "No se pudo eliminar la novedad."));
        } finally {
            setGuardando(false);
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1.5">
                    <CardTitle>Novedades del período</CardTitle>
                    <CardDescription>
                        Ingrese aquí las horas extras, comisiones, bonificaciones y descuentos de la
                        asociación antes de calcular la nómina de fin de mes.
                    </CardDescription>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                    <PeriodoSelect
                        value={periodo?.periodoId ?? null}
                        onChange={setPeriodo}
                        seleccionarPrimero
                    />
                    <Button onClick={() => abrirFormulario()} disabled={!periodo || cerrado}>
                        <PlusIcon />
                        Agregar novedad
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {cerrado && (
                    <Alert>
                        <LockIcon />
                        <AlertDescription>
                            El período está cerrado; las novedades solo pueden consultarse.
                        </AlertDescription>
                    </Alert>
                )}

                {novedades.length > 0 && (
                    <div className="flex flex-wrap gap-6 text-sm">
                        <span>
                            <span className="text-muted-foreground">Registros: </span>
                            <strong>{novedades.length}</strong>
                        </span>
                        <span>
                            <span className="text-muted-foreground">Ingresos variables: </span>
                            <strong className="tabular-nums">{formatMoneda(totales.ingresos)}</strong>
                        </span>
                        <span>
                            <span className="text-muted-foreground">Descuentos: </span>
                            <strong className="tabular-nums">{formatMoneda(totales.descuentos)}</strong>
                        </span>
                    </div>
                )}

                {cargando ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Empleado</TableHead>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Horas / Monto</TableHead>
                                <TableHead>Observación</TableHead>
                                <TableHead className="w-24">
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {novedades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        {periodo
                                            ? "No hay novedades registradas en este período"
                                            : "Seleccione un período"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                novedades.map((n) => {
                                    const esDescuento = n.concepto?.naturaleza?.codigo === "DEDUCCION";
                                    return (
                                        <TableRow key={n.novedadId}>
                                            <TableCell className="font-medium">
                                                {n.empleado?.nombres} {n.empleado?.apellidos}
                                                <span className="block font-mono text-xs text-muted-foreground">
                                                    {n.empleado?.codigoEmpleado}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {n.concepto?.codigo}
                                                </span>{" "}
                                                {n.concepto?.nombre}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={esDescuento ? "destructive" : "secondary"}>
                                                    {esDescuento ? "Descuento" : "Ingreso"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {n.cantidad !== null
                                                    ? `${n.cantidad} h`
                                                    : formatMoneda(n.monto)}
                                            </TableCell>
                                            <TableCell className="max-w-56 truncate text-muted-foreground">
                                                {n.observacion ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!cerrado && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label="Editar novedad"
                                                            onClick={() => abrirFormulario(n)}
                                                        >
                                                            <PencilIcon />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label="Eliminar novedad"
                                                            onClick={() => setAEliminar(n)}
                                                        >
                                                            <Trash2Icon />
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>{editId ? "Editar novedad" : "Agregar novedad"}</DialogTitle>
                            <DialogDescription>
                                Las horas extras se valorizan automáticamente según el salario del
                                empleado y los parámetros del año.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2">
                            <Label htmlFor="empleadoId">Empleado</Label>
                            <Select
                                items={opcionesEmpleado}
                                value={form.empleadoId}
                                onValueChange={(v) => v && setForm((f) => ({ ...f, empleadoId: v }))}
                                disabled={!!editId}
                            >
                                <SelectTrigger id="empleadoId" className="w-full">
                                    <SelectValue placeholder="Seleccione un empleado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {empleados.map((e) => (
                                        <SelectItem key={e.empleadoId} value={String(e.empleadoId)}>
                                            {opcionesEmpleado[String(e.empleadoId)]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="conceptoId">Concepto</Label>
                            <Select
                                items={opcionesConcepto}
                                value={form.conceptoId}
                                onValueChange={(v) => v && setForm((f) => ({ ...f, conceptoId: v }))}
                            >
                                <SelectTrigger id="conceptoId" className="w-full">
                                    <SelectValue placeholder="Seleccione un concepto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {conceptos.map((c) => (
                                        <SelectItem key={c.conceptoId} value={String(c.conceptoId)}>
                                            {opcionesConcepto[String(c.conceptoId)]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valor">
                                {capturaHoras ? "Cantidad de horas" : "Monto (Q)"}
                            </Label>
                            <Input
                                id="valor"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.valor}
                                onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                                disabled={!conceptoSeleccionado}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="observacion">Observación (opcional)</Label>
                            <Input
                                id="observacion"
                                maxLength={250}
                                value={form.observacion}
                                onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))}
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={guardando}>
                                {guardando && <Loader2 className="animate-spin" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!aEliminar}
                titulo="Eliminar novedad"
                descripcion={`Se eliminará ${aEliminar?.concepto?.nombre ?? "la novedad"} de ${
                    aEliminar?.empleado?.nombres ?? ""
                }. Si la nómina ya fue calculada, vuelva a calcularla para reflejar el cambio.`}
                textoConfirmar="Eliminar"
                destructivo
                procesando={guardando}
                onConfirmar={confirmarEliminar}
                onCancelar={() => setAEliminar(null)}
            />
        </Card>
    );
}
