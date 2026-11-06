import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FileSliders, Loader2, LockIcon, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { conceptosApi } from "../Conceptos.api";
import type { Concepto, CreateConceptoDto, NaturalezaConcepto } from "../Conceptos.types";
import { ReglasFiscalesDialog } from "./ReglasFiscalesDialog";

const FORM_INICIAL: CreateConceptoDto = {
    codigo: "",
    nombre: "",
    naturalezaId: 0,
    tipoCalculo: "MANUAL",
    cuentaContable: "",
    orden: 0,
};

const TIPOS_CALCULO = {
    FIJO: "Fijo",
    PORCENTAJE: "Porcentaje",
    FORMULA: "Fórmula",
    MANUAL: "Manual (por novedad)",
} as const;

const COLOR_NATURALEZA: Record<string, string> = {
    PERCEPCION: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    DEDUCCION: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    PROVISION: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
};

export function ConceptosTable() {
    const { esAdmin } = useAuth();
    const [conceptos, setConceptos] = useState<Concepto[]>([]);
    const [naturalezas, setNaturalezas] = useState<NaturalezaConcepto[]>([]);
    const [form, setForm] = useState<CreateConceptoDto>(FORM_INICIAL);
    const [editando, setEditando] = useState<Concepto | null>(null);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [eliminar, setEliminar] = useState<Concepto | null>(null);
    const [reglasConcepto, setReglasConcepto] = useState<Concepto | null>(null);

    const bloqueado = editando?.esSistema ?? false;
    const opcionesNaturaleza = Object.fromEntries(
        naturalezas.map((n) => [String(n.naturalezaId), n.nombre]),
    );

    async function cargar() {
        try {
            const [conceptosData, naturalezasData] = await Promise.all([
                conceptosApi.getAllConceptos(),
                conceptosApi.getAllNaturalezas(),
            ]);
            setConceptos(conceptosData);
            setNaturalezas(naturalezasData);
        } catch (err) {
            toast.error(mensajeError(err, "No se pudieron cargar los conceptos."));
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        void cargar();
    }, []);

    function abrirFormulario(c?: Concepto) {
        setEditando(c ?? null);
        setForm(
            c
                ? {
                      codigo: c.codigo,
                      nombre: c.nombre,
                      naturalezaId: c.naturalezaId,
                      tipoCalculo: c.tipoCalculo,
                      cuentaContable: c.cuentaContable ?? "",
                      orden: c.orden,
                  }
                : FORM_INICIAL,
        );
        setError("");
        setOpen(true);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!form.naturalezaId) {
            setError("Seleccione la naturaleza del concepto.");
            return;
        }
        setError("");
        setGuardando(true);
        try {
            const dto = { ...form, cuentaContable: form.cuentaContable || undefined };
            if (editando) {
                await conceptosApi.updateConcepto(editando.conceptoId, dto);
                toast.success("Concepto actualizado");
            } else {
                await conceptosApi.createConcepto(dto);
                toast.success("Concepto creado");
            }
            setOpen(false);
            await cargar();
        } catch (err) {
            setError(mensajeError(err, "No se pudo guardar el concepto."));
        } finally {
            setGuardando(false);
        }
    }

    async function confirmarEliminar() {
        if (!eliminar) return;
        setGuardando(true);
        try {
            await conceptosApi.removeConcepto(eliminar.conceptoId);
            toast.success("Concepto eliminado");
            await cargar();
        } catch (err) {
            toast.error(mensajeError(err, "No se pudo eliminar el concepto."));
        } finally {
            setGuardando(false);
            setEliminar(null);
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Conceptos de nómina</CardTitle>
                {esAdmin && (
                    <Button onClick={() => abrirFormulario()}>
                        <Plus />
                        Nuevo concepto
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
                                <TableHead className="w-20">Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Naturaleza</TableHead>
                                <TableHead>Cálculo</TableHead>
                                <TableHead>Cuenta</TableHead>
                                <TableHead className="w-12">
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {conceptos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No hay conceptos registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                conceptos.map((c) => (
                                    <TableRow key={c.conceptoId}>
                                        <TableCell className="font-mono text-xs">{c.codigo}</TableCell>
                                        <TableCell className="font-medium">
                                            <span className="flex items-center gap-2">
                                                {c.nombre}
                                                {c.esSistema && (
                                                    <Badge variant="outline" className="gap-1">
                                                        <LockIcon className="size-3" />
                                                        Sistema
                                                    </Badge>
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={COLOR_NATURALEZA[c.naturaleza?.codigo ?? ""]}>
                                                {c.naturaleza?.nombre ?? "-"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{TIPOS_CALCULO[c.tipoCalculo]}</TableCell>
                                        <TableCell className="font-mono text-xs">{c.cuentaContable ?? "-"}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Acciones para ${c.nombre}`}
                                                        >
                                                            <MoreHorizontal />
                                                        </Button>
                                                    }
                                                />
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setReglasConcepto(c)}>
                                                        <FileSliders />
                                                        Tratamiento fiscal
                                                    </DropdownMenuItem>
                                                    {esAdmin && (
                                                        <DropdownMenuItem onClick={() => abrirFormulario(c)}>
                                                            <Pencil />
                                                            Editar
                                                        </DropdownMenuItem>
                                                    )}
                                                    {esAdmin && !c.esSistema && (
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() => setEliminar(c)}
                                                        >
                                                            <Trash2 />
                                                            Eliminar
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

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editando ? "Editar concepto" : "Nuevo concepto"}</DialogTitle>
                            <DialogDescription>
                                Los conceptos manuales se capturan como novedades del período y el cálculo
                                los incluye automáticamente.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {bloqueado && (
                                <Alert>
                                    <LockIcon />
                                    <AlertDescription>
                                        Concepto de sistema: el código, la naturaleza y el tipo de cálculo
                                        los usa el motor de nómina y no se pueden modificar.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="codigo">Código</Label>
                                    <Input
                                        id="codigo"
                                        value={form.codigo}
                                        onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                                        placeholder="106"
                                        maxLength={20}
                                        disabled={bloqueado}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="orden">Orden en el recibo</Label>
                                    <Input
                                        id="orden"
                                        type="number"
                                        min={0}
                                        value={form.orden ?? 0}
                                        onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="naturalezaId">Naturaleza</Label>
                                    <Select
                                        items={opcionesNaturaleza}
                                        value={form.naturalezaId ? String(form.naturalezaId) : ""}
                                        onValueChange={(v) => v && setForm({ ...form, naturalezaId: Number(v) })}
                                        disabled={bloqueado}
                                    >
                                        <SelectTrigger id="naturalezaId" className="w-full">
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {naturalezas.map((n) => (
                                                <SelectItem key={n.naturalezaId} value={String(n.naturalezaId)}>
                                                    {n.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tipoCalculo">Tipo de cálculo</Label>
                                    <Select
                                        items={TIPOS_CALCULO}
                                        value={form.tipoCalculo}
                                        onValueChange={(v) => v && setForm({ ...form, tipoCalculo: v })}
                                        disabled={bloqueado}
                                    >
                                        <SelectTrigger id="tipoCalculo" className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(TIPOS_CALCULO).map(([valor, etiqueta]) => (
                                                <SelectItem key={valor} value={valor}>
                                                    {etiqueta}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cuentaContable">Cuenta contable</Label>
                                <Input
                                    id="cuentaContable"
                                    value={form.cuentaContable ?? ""}
                                    onChange={(e) => setForm({ ...form, cuentaContable: e.target.value })}
                                    placeholder="2101-05"
                                    pattern="\d{4}-\d{2}"
                                    title="Formato 0000-00"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Requerida en descuentos para que la póliza cuadre.
                                </p>
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
                            <Button type="submit" disabled={guardando}>
                                {guardando && <Loader2 className="animate-spin" />}
                                {editando ? "Guardar cambios" : "Crear concepto"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!eliminar}
                titulo="Eliminar concepto"
                descripcion={`Se eliminará ${eliminar?.nombre ?? ""}. Las nóminas ya calculadas conservan el detalle histórico.`}
                textoConfirmar="Eliminar"
                destructivo
                procesando={guardando}
                onConfirmar={confirmarEliminar}
                onCancelar={() => setEliminar(null)}
            />

            {reglasConcepto && (
                <ReglasFiscalesDialog
                    concepto={reglasConcepto}
                    open={!!reglasConcepto}
                    onOpenChange={(abierto) => !abierto && setReglasConcepto(null)}
                />
            )}
        </Card>
    );
}
