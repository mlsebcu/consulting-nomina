import { useEffect, useState, type FormEvent } from "react";
import type {
    Concepto,
    CreateConceptoDto,
    NaturalezaConcepto,
} from "../Conceptos.types";
import { conceptosApi } from "../Conceptos.api";
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
    FileSliders,
} from "lucide-react";
import { ReglasFiscalesDialog } from "./ReglasFiscalesDialog";

const FORM_INICIAL: CreateConceptoDto = {
    codigo: "",
    nombre: "",
    naturalezaId: 0,
    tipoCalculo: "FIJO",
    cuentaContable: "",
    orden: 0,
    esSistema: false,
};

const TIPOS_CALCULO = [
    { value: "FIJO", label: "Fijo" },
    { value: "PORCENTAJE", label: "Porcentaje" },
    { value: "FORMULA", label: "Fórmula" },
    { value: "MANUAL", label: "Manual" },
];

export function ConceptosTable() {
    const [conceptos, setConceptos] = useState<Concepto[]>([]);
    const [naturalezas, setNaturalezas] = useState<NaturalezaConcepto[]>([]);
    const [form, setForm] = useState<CreateConceptoDto>(FORM_INICIAL);
    const [editId, setEditId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminar, setEliminar] = useState<Concepto | null>(null);
    const [reglasConcepto, setReglasConcepto] = useState<Concepto | null>(null);

    async function cargar() {
        setCargando(true);
        try {
            const [conceptosData, naturalezasData] = await Promise.all([
                conceptosApi.getAllConceptos(),
                conceptosApi.getAllNaturalezas(),
            ]);
            setConceptos(conceptosData);
            setNaturalezas(naturalezasData);
        } catch {
            setError("No se pudieron cargar los conceptos.");
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

    function abrirEditar(c: Concepto) {
        setEditId(c.conceptoId);
        setForm({
            codigo: c.codigo,
            nombre: c.nombre,
            naturalezaId: c.naturalezaId,
            tipoCalculo: c.tipoCalculo,
            cuentaContable: c.cuentaContable ?? "",
            orden: c.orden,
            esSistema: c.esSistema,
        });
        setError("");
        setOpen(true);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if (!form.naturalezaId) {
            setError("Debe seleccionar una naturaleza.");
            return;
        }

        setGuardando(true);
        try {
            const dto: CreateConceptoDto = {
                ...form,
                cuentaContable: form.cuentaContable || undefined,
            };

            if (editId) {
                await conceptosApi.updateConcepto(editId, dto);
            } else {
                await conceptosApi.createConcepto(dto);
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
                    : (mensaje ?? "No se pudo guardar el concepto."),
            );
        } finally {
            setGuardando(false);
        }
    }

    async function handleEliminar() {
        if (!eliminar) return;
        try {
            await conceptosApi.removeConcepto(eliminar.conceptoId);
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
                    : (mensaje ?? "No se pudo eliminar el concepto."),
            );
            setEliminar(null);
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Conceptos de Nómina</CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button onClick={abrirNuevo}>
                                <Plus />
                                Nuevo concepto
                            </Button>
                        }
                    />
                    <DialogContent className="sm:max-w-lg">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editId
                                        ? "Editar concepto"
                                        : "Nuevo concepto"}
                                </DialogTitle>
                                <DialogDescription>
                                    Los conceptos representan cada línea que
                                    puede aparecer en una nómina: percepciones,
                                    deducciones y provisiones.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="codigo">Código</Label>
                                        <Input
                                            id="codigo"
                                            value={form.codigo}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    codigo: e.target.value,
                                                })
                                            }
                                            placeholder="Ej. 100"
                                            required
                                            maxLength={20}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="orden">Orden</Label>
                                        <Input
                                            id="orden"
                                            type="number"
                                            value={form.orden ?? 0}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    orden: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre</Label>
                                    <Input
                                        id="nombre"
                                        value={form.nombre}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                nombre: e.target.value,
                                            })
                                        }
                                        placeholder="Ej. Salario Base"
                                        required
                                        maxLength={100}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="naturalezaId">
                                        Naturaleza
                                    </Label>
                                    <Select
                                        value={
                                            form.naturalezaId
                                                ? String(form.naturalezaId)
                                                : undefined
                                        }
                                        onValueChange={(v) =>
                                            v &&
                                            setForm({
                                                ...form,
                                                naturalezaId: Number(v),
                                            })
                                        }
                                    >
                                        <SelectTrigger id="naturalezaId">
                                            <SelectValue placeholder="Seleccione una naturaleza" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {naturalezas.map((n) => (
                                                <SelectItem
                                                    key={n.naturalezaId}
                                                    value={String(
                                                        n.naturalezaId,
                                                    )}
                                                >
                                                    {n.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tipoCalculo">
                                            Tipo de cálculo
                                        </Label>
                                        <Select
                                            value={form.tipoCalculo}
                                            onValueChange={(v) =>
                                                v &&
                                                setForm({
                                                    ...form,
                                                    tipoCalculo: v,
                                                })
                                            }
                                        >
                                            <SelectTrigger id="tipoCalculo">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TIPOS_CALCULO.map((t) => (
                                                    <SelectItem
                                                        key={t.value}
                                                        value={t.value}
                                                    >
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cuentaContable">
                                            Cuenta contable
                                        </Label>
                                        <Input
                                            id="cuentaContable"
                                            value={form.cuentaContable ?? ""}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    cuentaContable:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Ej. 5101-01"
                                            maxLength={20}
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
                                        "Crear concepto"
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
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Naturaleza</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Cuenta</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {conceptos.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-muted-foreground py-8"
                                    >
                                        No hay conceptos registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                conceptos.map((c) => (
                                    <TableRow key={c.conceptoId}>
                                        <TableCell className="font-mono text-xs">
                                            {c.codigo}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {c.nombre}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={colorNaturaleza(
                                                    c.naturaleza?.codigo ?? "",
                                                )}
                                            >
                                                {c.naturaleza?.nombre ?? "-"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{c.tipoCalculo}</TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {c.cuentaContable ?? "-"}
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
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            abrirEditar(c)
                                                        }
                                                    >
                                                        <Pencil />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setReglasConcepto(c)
                                                        }
                                                    >
                                                        <FileSliders />
                                                        Reglas fiscales
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setEliminar(c)
                                                        }
                                                    >
                                                        <Trash2 />
                                                        Eliminar
                                                    </DropdownMenuItem>
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

            {/* Dialog de eliminación */}
            <Dialog
                open={!!eliminar}
                onOpenChange={(open) => !open && setEliminar(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar concepto</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro que desea eliminar el concepto{" "}
                            <strong>{eliminar?.nombre}</strong>? No se podrá
                            eliminar si ya fue usado en nóminas.
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

            {/* Dialog de reglas fiscales */}
            {reglasConcepto && (
                <ReglasFiscalesDialog
                    concepto={reglasConcepto}
                    open={!!reglasConcepto}
                    onOpenChange={(open) => !open && setReglasConcepto(null)}
                />
            )}
        </Card>
    );
}
