import { useEffect, useState, type FormEvent } from "react";
import type {
    CreateNaturalezaDto,
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil, Trash2, Plus, Loader2, MoreHorizontal } from "lucide-react";

const FORM_INICIAL: CreateNaturalezaDto = {
    codigo: "",
    nombre: "",
    afectaNeto: true,
    esProvision: false,
    orden: 0,
};

export function NaturalezasTable() {
    const [naturalezas, setNaturalezas] = useState<NaturalezaConcepto[]>([]);
    const [form, setForm] = useState<CreateNaturalezaDto>(FORM_INICIAL);
    const [editId, setEditId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminar, setEliminar] = useState<NaturalezaConcepto | null>(null);

    async function cargar() {
        setCargando(true);
        try {
            setNaturalezas(await conceptosApi.getAllNaturalezas());
        } catch {
            setError("No se pudieron cargar las naturalezas.");
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

    function abrirEditar(n: NaturalezaConcepto) {
        setEditId(n.naturalezaId);
        setForm({
            codigo: n.codigo,
            nombre: n.nombre,
            afectaNeto: n.afectaNeto,
            esProvision: n.esProvision,
            orden: n.orden,
        });
        setError("");
        setOpen(true);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setGuardando(true);
        try {
            if (editId) {
                await conceptosApi.updateNaturaleza(editId, form);
            } else {
                await conceptosApi.createNaturaleza(form);
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
                    : (mensaje ?? "No se pudo guardar la naturaleza."),
            );
        } finally {
            setGuardando(false);
        }
    }

    async function handleEliminar() {
        if (!eliminar) return;
        try {
            await conceptosApi.removeNaturaleza(eliminar.naturalezaId);
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
                    : (mensaje ?? "No se pudo eliminar la naturaleza."),
            );
            setEliminar(null);
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Naturalezas de Concepto</CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button onClick={abrirNuevo}>
                                <Plus />
                                Nueva naturaleza
                            </Button>
                        }
                    />
                    <DialogContent className="sm:max-w-lg">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editId
                                        ? "Editar naturaleza"
                                        : "Nueva naturaleza"}
                                </DialogTitle>
                                <DialogDescription>
                                    Las naturalezas clasifican los conceptos de
                                    nómina (percepción, deducción, provisión,
                                    etc.).
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
                                            placeholder="Ej. PERCEPCION"
                                            required
                                            maxLength={15}
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
                                        placeholder="Ej. Percepción"
                                        required
                                        maxLength={50}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.afectaNeto}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    afectaNeto:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        Afecta el neto
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.esProvision}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    esProvision:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        Es provisión
                                    </label>
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
                                        "Crear naturaleza"
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
                                <TableHead>Afecta Neto</TableHead>
                                <TableHead>Provisión</TableHead>
                                <TableHead>Orden</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {naturalezas.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-muted-foreground py-8"
                                    >
                                        No hay naturalezas registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                naturalezas.map((n) => (
                                    <TableRow key={n.naturalezaId}>
                                        <TableCell className="font-mono text-xs">
                                            {n.codigo}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {n.nombre}
                                        </TableCell>
                                        <TableCell>
                                            {n.afectaNeto ? "Sí" : "No"}
                                        </TableCell>
                                        <TableCell>
                                            {n.esProvision ? "Sí" : "No"}
                                        </TableCell>
                                        <TableCell>{n.orden}</TableCell>
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
                                                            abrirEditar(n)
                                                        }
                                                    >
                                                        <Pencil />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setEliminar(n)
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

            <Dialog
                open={!!eliminar}
                onOpenChange={(open) => !open && setEliminar(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar naturaleza</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro que desea eliminar la naturaleza{" "}
                            <strong>{eliminar?.nombre}</strong>? No se podrá
                            eliminar si tiene conceptos asociados.
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
        </Card>
    );
}
