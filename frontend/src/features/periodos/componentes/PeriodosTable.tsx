import { useEffect, useState, type FormEvent } from "react";
import type { CreatePeriodoDto, Periodo } from "../Periodos.types";
import { periodosApi } from "../Periodos.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Pencil,
    Trash2,
    Plus,
    Loader2,
    MoreHorizontal,
    Lock,
} from "lucide-react";
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

const FORM_INICIAL: CreatePeriodoDto = {
    anio: new Date().getFullYear(),
    mes: 1,
    quincena: 1,
    numeroPeriodo: 1,
    tipoPeriodo: "QUINCENAL",
    fechaInicio: "",
    fechaFin: "",
};

export function PeriodosTable() {
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [form, setForm] = useState<CreatePeriodoDto>(FORM_INICIAL);
    const [editId, setEditId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminar, setEliminar] = useState<Periodo | null>(null);
    const [cerrar, setCerrar] = useState<Periodo | null>(null);

    async function cargar() {
        setCargando(true);
        try {
            setPeriodos(await periodosApi.getAll());
        } catch {
            setError("No se pudieron cargar los períodos.");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargar();
    }, []);

    function abrirNuevo() {
        setEditId(null);
        setForm(FORM_INICIAL);
        setError("");
        setOpen(true);
    }

    function abrirEditar(p: Periodo) {
        setEditId(p.periodoId);
        setForm({
            anio: p.anio,
            mes: p.mes,
            quincena: p.quincena ?? undefined,
            numeroPeriodo: p.numeroPeriodo,
            tipoPeriodo: p.tipoPeriodo,
            fechaInicio: p.fechaInicio.split("T")[0],
            fechaFin: p.fechaFin.split("T")[0],
        });
        setError("");
        setOpen(true);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setGuardando(true);
        try {
            const dto: CreatePeriodoDto = {
                ...form,
                quincena:
                    form.tipoPeriodo === "MENSUAL" ? undefined : form.quincena,
            };

            if (editId) {
                await periodosApi.update(editId, dto);
            } else {
                await periodosApi.create(dto);
            }
            setOpen(false);
            await cargar();
        } catch (err: unknown) {
            const axiosError = err as {
                response?: { data?: { message?: string | string[] } };
            };
            const mensaje = axiosError.response?.data?.message;
            setError(
                Array.isArray(mensaje)
                    ? mensaje.join(", ")
                    : (mensaje ?? "No se pudo guardar el período."),
            );
        } finally {
            setGuardando(false);
        }
    }

    async function handleEliminar() {
        if (!eliminar) return;
        try {
            await periodosApi.remove(eliminar.periodoId);
            setEliminar(null);
            await cargar();
        } catch (err: unknown) {
            const axiosError = err as {
                response?: { data?: { message?: string | string[] } };
            };
            const mensaje = axiosError.response?.data?.message;
            alert(
                Array.isArray(mensaje)
                    ? mensaje.join(", ")
                    : (mensaje ?? "No se pudo eliminar el período."),
            );
            setEliminar(null);
        }
    }

    async function handleCerrar() {
        if (!cerrar) return;
        try {
            await periodosApi.cerrar(cerrar.periodoId);
            setCerrar(null);
            await cargar();
        } catch (err: unknown) {
            const axiosError = err as {
                response?: { data?: { message?: string | string[] } };
            };
            const mensaje = axiosError.response?.data?.message;
            alert(
                Array.isArray(mensaje)
                    ? mensaje.join(", ")
                    : (mensaje ?? "No se pudo cerrar el período."),
            );
            setCerrar(null);
        }
    }

    function colorEstado(estado: Periodo["estado"]) {
        switch (estado) {
            case "ABIERTO":
                return "bg-green-100 text-green-800 hover:bg-green-100";
            case "EN_REVISION":
                return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
            case "CERRADO":
                return "bg-gray-100 text-gray-800 hover:bg-gray-100";
        }
    }

    function nombrePeriodo(p: Periodo) {
        if (p.tipoPeriodo === "QUINCENAL") {
            return `${p.quincena}ª quincena`;
        }
        return "Mensual";
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Períodos de Nómina</CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button onClick={abrirNuevo}>
                                <Plus />
                                Nuevo período
                            </Button>
                        }
                    />
                    <DialogContent className="sm:max-w-lg">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editId
                                        ? "Editar período"
                                        : "Nuevo período"}
                                </DialogTitle>
                                <DialogDescription>
                                    Los períodos definen los rangos de fechas
                                    para calcular nóminas quincenales o
                                    mensuales.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="anio">Año</Label>
                                        <Input
                                            id="anio"
                                            type="number"
                                            value={form.anio}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    anio: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="numeroPeriodo">
                                            Número de período
                                        </Label>
                                        <Input
                                            id="numeroPeriodo"
                                            type="number"
                                            value={form.numeroPeriodo}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    numeroPeriodo: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mes">Mes</Label>
                                    <Select
                                        value={String(form.mes)}
                                        onValueChange={(v) =>
                                            v &&
                                            setForm({ ...form, mes: Number(v) })
                                        }
                                    >
                                        <SelectTrigger id="mes">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MESES.map((m, i) => (
                                                <SelectItem
                                                    key={i + 1}
                                                    value={String(i + 1)}
                                                >
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tipoPeriodo">
                                            Tipo de período
                                        </Label>
                                        <Select
                                            value={form.tipoPeriodo}
                                            onValueChange={(v) =>
                                                v &&
                                                setForm({
                                                    ...form,
                                                    tipoPeriodo: v as
                                                        "QUINCENAL" | "MENSUAL",
                                                })
                                            }
                                        >
                                            <SelectTrigger id="tipoPeriodo">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="QUINCENAL">
                                                    Quincenal
                                                </SelectItem>
                                                <SelectItem value="MENSUAL">
                                                    Mensual
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {form.tipoPeriodo === "QUINCENAL" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="quincena">
                                                Quincena
                                            </Label>
                                            <Select
                                                value={String(
                                                    form.quincena ?? 1,
                                                )}
                                                onValueChange={(v) =>
                                                    v &&
                                                    setForm({
                                                        ...form,
                                                        quincena: Number(v),
                                                    })
                                                }
                                            >
                                                <SelectTrigger id="quincena">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1ª
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2ª
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fechaInicio">
                                            Fecha de inicio
                                        </Label>
                                        <Input
                                            id="fechaInicio"
                                            type="date"
                                            value={form.fechaInicio}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    fechaInicio: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fechaFin">
                                            Fecha de fin
                                        </Label>
                                        <Input
                                            id="fechaFin"
                                            type="date"
                                            value={form.fechaFin}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    fechaFin: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>
                                            {error}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={guardando}>
                                    {guardando ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : editId ? (
                                        "Guardar cambios"
                                    ) : (
                                        "Crear período"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent>
                {cargando ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Período</TableHead>
                                <TableHead>Año</TableHead>
                                <TableHead>Mes</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Rango</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {periodos.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center text-muted-foreground py-8"
                                    >
                                        No hay períodos registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                periodos.map((p) => (
                                    <TableRow key={p.periodoId}>
                                        <TableCell className="font-mono text-xs">
                                            #{p.numeroPeriodo}
                                        </TableCell>
                                        <TableCell>{p.anio}</TableCell>
                                        <TableCell>
                                            {MESES[p.mes - 1]}
                                        </TableCell>
                                        <TableCell>
                                            {nombrePeriodo(p)}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {formatFecha(p.fechaInicio)} {"-> "}
                                            {formatFecha(p.fechaFin)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={colorEstado(
                                                    p.estado,
                                                )}
                                            >
                                                {p.estado}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <MoreHorizontal />
                                                        </Button>
                                                    }
                                                />
                                                <DropdownMenuContent align="end">
                                                    {p.estado !== "CERRADO" && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    abrirEditar(
                                                                        p,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setCerrar(p)
                                                                }
                                                            >
                                                                <Lock />
                                                                Cerrar período
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    setEliminar(
                                                                        p,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {p.estado === "CERRADO" && (
                                                        <DropdownMenuItem
                                                            disabled
                                                        >
                                                            <Lock />
                                                            Período cerrado
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {/* Confirmar eliminar */}
            <Dialog
                open={!!eliminar}
                onOpenChange={(open) => !open && setEliminar(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar período</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro que desea eliminar el período{" "}
                            <strong>
                                #{eliminar?.numeroPeriodo} - {eliminar?.anio}
                            </strong>
                            ? Esta acción se puede revertir solo por un
                            administrador.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEliminar(null)}
                        >
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleEliminar}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmar cierre */}
            <Dialog
                open={!!cerrar}
                onOpenChange={(open) => !open && setCerrar(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cerrar período</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro que desea cerrar el período{" "}
                            <strong>
                                #{cerrar?.numeroPeriodo} - {cerrar?.anio}
                            </strong>
                            ? Una vez cerrado, no se podrá modificar ni calcular
                            nómina nuevamente.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCerrar(null)}
                        >
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleCerrar}>
                            Cerrar período
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
