import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, Lock, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EstadoBadge } from "@/components/EstadoBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useAuth } from "@/context/AuthContext";
import { mensajeError } from "@/utils/errores";
import { MESES, nombrePeriodo, rangoPeriodo } from "@/utils/periodos";
import { periodosApi } from "../Periodos.api";
import type { CreatePeriodoDto, Periodo } from "../Periodos.types";

const DIA_CORTE_QUINCENA = 15;
const OPCIONES_MES = Object.fromEntries(MESES.map((m, i) => [String(i + 1), m]));
const TIPOS_PERIODO = { MENSUAL: "Mensual", QUINCENAL: "Quincenal" } as const;
const QUINCENAS = { "1": "Primera (1 al 15)", "2": "Segunda (16 a fin de mes)" } as const;

function aIso(anio: number, mes: number, dia: number) {
    return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function fechasSugeridas(f: Pick<CreatePeriodoDto, "anio" | "mes" | "tipoPeriodo" | "quincena">) {
    const ultimoDia = new Date(f.anio, f.mes, 0).getDate();
    if (f.tipoPeriodo === "MENSUAL") {
        return { fechaInicio: aIso(f.anio, f.mes, 1), fechaFin: aIso(f.anio, f.mes, ultimoDia) };
    }
    return f.quincena === 2
        ? { fechaInicio: aIso(f.anio, f.mes, DIA_CORTE_QUINCENA + 1), fechaFin: aIso(f.anio, f.mes, ultimoDia) }
        : { fechaInicio: aIso(f.anio, f.mes, 1), fechaFin: aIso(f.anio, f.mes, DIA_CORTE_QUINCENA) };
}

function formularioInicial(): CreatePeriodoDto {
    const hoy = new Date();
    const base = {
        anio: hoy.getFullYear(),
        mes: hoy.getMonth() + 1,
        tipoPeriodo: "MENSUAL" as const,
        quincena: undefined,
    };
    return { ...base, numeroPeriodo: base.mes, ...fechasSugeridas(base) };
}

export function PeriodosTable() {
    const { esAdmin } = useAuth();
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [form, setForm] = useState<CreatePeriodoDto>(formularioInicial);
    const [editId, setEditId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [eliminar, setEliminar] = useState<Periodo | null>(null);
    const [cerrar, setCerrar] = useState<Periodo | null>(null);

    async function cargar() {
        try {
            setPeriodos(await periodosApi.getAll());
        } catch (err) {
            toast.error(mensajeError(err, "No se pudieron cargar los períodos."));
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        void cargar();
    }, []);

    function actualizarCalendario(cambios: Partial<CreatePeriodoDto>) {
        setForm((prev) => {
            const siguiente = { ...prev, ...cambios };
            if (siguiente.tipoPeriodo === "QUINCENAL" && !siguiente.quincena) siguiente.quincena = 1;
            if (siguiente.tipoPeriodo === "MENSUAL") siguiente.quincena = undefined;
            return { ...siguiente, ...fechasSugeridas(siguiente) };
        });
    }

    function abrirFormulario(p?: Periodo) {
        setEditId(p?.periodoId ?? null);
        setForm(
            p
                ? {
                      anio: p.anio,
                      mes: p.mes,
                      quincena: p.quincena ?? undefined,
                      numeroPeriodo: p.numeroPeriodo,
                      tipoPeriodo: p.tipoPeriodo,
                      fechaInicio: p.fechaInicio.slice(0, 10),
                      fechaFin: p.fechaFin.slice(0, 10),
                  }
                : formularioInicial(),
        );
        setError("");
        setOpen(true);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setProcesando(true);
        try {
            if (editId) {
                await periodosApi.update(editId, form);
                toast.success("Período actualizado");
            } else {
                await periodosApi.create(form);
                toast.success("Período creado");
            }
            setOpen(false);
            await cargar();
        } catch (err) {
            setError(mensajeError(err, "No se pudo guardar el período."));
        } finally {
            setProcesando(false);
        }
    }

    async function ejecutar(accion: "eliminar" | "cerrar") {
        const periodo = accion === "eliminar" ? eliminar : cerrar;
        if (!periodo) return;
        setProcesando(true);
        try {
            if (accion === "eliminar") {
                await periodosApi.remove(periodo.periodoId);
                toast.success("Período eliminado");
            } else {
                await periodosApi.cerrar(periodo.periodoId);
                toast.success("Período cerrado");
            }
            await cargar();
        } catch (err) {
            toast.error(mensajeError(err, `No se pudo ${accion} el período.`));
        } finally {
            setProcesando(false);
            setEliminar(null);
            setCerrar(null);
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Períodos de nómina</CardTitle>
                {esAdmin && (
                    <Button onClick={() => abrirFormulario()}>
                        <Plus />
                        Nuevo período
                    </Button>
                )}
            </CardHeader>

            <CardContent>
                {cargando ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">No.</TableHead>
                                <TableHead>Período</TableHead>
                                <TableHead>Rango</TableHead>
                                <TableHead>Estado</TableHead>
                                {esAdmin && (
                                    <TableHead className="w-12">
                                        <span className="sr-only">Acciones</span>
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {periodos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                        No hay períodos registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                periodos.map((p) => (
                                    <TableRow key={p.periodoId}>
                                        <TableCell className="font-mono text-xs">{p.numeroPeriodo}</TableCell>
                                        <TableCell className="font-medium">{nombrePeriodo(p)}</TableCell>
                                        <TableCell className="text-muted-foreground">{rangoPeriodo(p)}</TableCell>
                                        <TableCell>
                                            <EstadoBadge estado={p.estado} />
                                        </TableCell>
                                        {esAdmin && (
                                            <TableCell>
                                                {p.estado !== "CERRADO" && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            render={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    aria-label={`Acciones para ${nombrePeriodo(p)}`}
                                                                >
                                                                    <MoreHorizontal />
                                                                </Button>
                                                            }
                                                        />
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => abrirFormulario(p)}>
                                                                <Pencil />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setCerrar(p)}>
                                                                <Lock />
                                                                Cerrar período
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() => setEliminar(p)}
                                                            >
                                                                <Trash2 />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editId ? "Editar período" : "Nuevo período"}</DialogTitle>
                            <DialogDescription>
                                Las fechas se proponen según el mes y la frecuencia; puede ajustarlas si
                                la empresa usa otro corte.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="anio">Año</Label>
                                    <Input
                                        id="anio"
                                        type="number"
                                        value={form.anio}
                                        onChange={(e) => actualizarCalendario({ anio: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="mes">Mes</Label>
                                    <Select
                                        items={OPCIONES_MES}
                                        value={String(form.mes)}
                                        onValueChange={(v) => v && actualizarCalendario({ mes: Number(v) })}
                                    >
                                        <SelectTrigger id="mes" className="w-full">
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
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tipoPeriodo">Frecuencia</Label>
                                    <Select
                                        items={TIPOS_PERIODO}
                                        value={form.tipoPeriodo}
                                        onValueChange={(v) => v && actualizarCalendario({ tipoPeriodo: v })}
                                    >
                                        <SelectTrigger id="tipoPeriodo" className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(TIPOS_PERIODO).map(([valor, nombre]) => (
                                                <SelectItem key={valor} value={valor}>
                                                    {nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {form.tipoPeriodo === "QUINCENAL" ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="quincena">Quincena</Label>
                                        <Select
                                            items={QUINCENAS}
                                            value={String(form.quincena ?? 1)}
                                            onValueChange={(v) => v && actualizarCalendario({ quincena: Number(v) })}
                                        >
                                            <SelectTrigger id="quincena" className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(QUINCENAS).map(([valor, nombre]) => (
                                                    <SelectItem key={valor} value={valor}>
                                                        {nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="numeroPeriodo">Número de período</Label>
                                        <Input
                                            id="numeroPeriodo"
                                            type="number"
                                            min={1}
                                            value={form.numeroPeriodo}
                                            onChange={(e) =>
                                                setForm({ ...form, numeroPeriodo: Number(e.target.value) })
                                            }
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {form.tipoPeriodo === "QUINCENAL" && (
                                <div className="space-y-2">
                                    <Label htmlFor="numeroPeriodoQ">Número de período</Label>
                                    <Input
                                        id="numeroPeriodoQ"
                                        type="number"
                                        min={1}
                                        value={form.numeroPeriodo}
                                        onChange={(e) =>
                                            setForm({ ...form, numeroPeriodo: Number(e.target.value) })
                                        }
                                        required
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                                    <Input
                                        id="fechaInicio"
                                        type="date"
                                        value={form.fechaInicio}
                                        onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fechaFin">Fecha de fin</Label>
                                    <Input
                                        id="fechaFin"
                                        type="date"
                                        min={form.fechaInicio}
                                        value={form.fechaFin}
                                        onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={procesando}>
                                {procesando && <Loader2 className="animate-spin" />}
                                {editId ? "Guardar cambios" : "Crear período"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!eliminar}
                titulo="Eliminar período"
                descripcion={`Se eliminará ${eliminar ? nombrePeriodo(eliminar) : ""}. Solo es posible si el período no está cerrado.`}
                textoConfirmar="Eliminar"
                destructivo
                procesando={procesando}
                onConfirmar={() => ejecutar("eliminar")}
                onCancelar={() => setEliminar(null)}
            />

            <ConfirmDialog
                open={!!cerrar}
                titulo="Cerrar período"
                descripcion={`Al cerrar ${cerrar ? nombrePeriodo(cerrar) : ""} se bloquean sus nóminas y novedades. Esta acción no se puede deshacer.`}
                textoConfirmar="Cerrar período"
                destructivo
                procesando={procesando}
                onConfirmar={() => ejecutar("cerrar")}
                onCancelar={() => setCerrar(null)}
            />
        </Card>
    );
}
