import { useEffect, useState, type FormEvent } from "react";
import type {
    CreateDepartamentoDto,
    Departamento,
} from "./Departamentos.types";
import { departamentosApi } from "./Departamentos.api";
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

const FORM_INICIAL: CreateDepartamentoDto = { nombre: "", cuentaContable: "" };

export default function DepartamentosPage() {
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [form, setForm] = useState<CreateDepartamentoDto>(FORM_INICIAL);
    const [editId, setEditId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminar, setEliminar] = useState<Departamento | null>(null);

    async function cargar() {
        setCargando(true);
        try {
            setDepartamentos(await departamentosApi.getAll());
        } catch {
            setError("No se pudieron cargar los departamentos.");
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

    function abrirEditar(d: Departamento) {
        setEditId(d.departamentoId);
        setForm({ nombre: d.nombre, cuentaContable: d.cuentaContable });
        setError("");
        setOpen(true);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setGuardando(true);
        try {
            if (editId) {
                await departamentosApi.update(editId, form);
            } else {
                await departamentosApi.create(form);
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
                    : (mensaje ?? "No se pudo guardar el departamento."),
            );
        } finally {
            setGuardando(false);
        }
    }

    async function handleEliminar() {
        if (!eliminar) return;
        try {
            await departamentosApi.remove(eliminar.departamentoId);
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
                    : (mensaje ?? "No se pudo eliminar el departamento."),
            );
            setEliminar(null);
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Departamentos</CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button onClick={abrirNuevo}>
                                <Plus />
                                Nuevo departamento
                            </Button>
                        }
                    />
                    <DialogContent className="sm:max-w-lg">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editId
                                        ? "Editar departamento"
                                        : "Nuevo departamento"}
                                </DialogTitle>
                                <DialogDescription>
                                    {editId
                                        ? "Actualiza los datos del departamento"
                                        : "Registra un nuevo departamento"}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
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
                                        placeholder="Ej. Finanzas"
                                        required
                                        maxLength={100}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cuentaContable">
                                        Cuenta contable
                                    </Label>
                                    <Input
                                        id="cuentaContable"
                                        value={form.cuentaContable}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                cuentaContable: e.target.value,
                                            })
                                        }
                                        placeholder="Ej. 5101-01"
                                        required
                                        maxLength={20}
                                    />
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
                                        "Crear departamento"
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
                                <TableHead>Nombre</TableHead>
                                <TableHead>Cuenta contable</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departamentos.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center text-muted-foreground py-8"
                                    >
                                        No hay departamentos registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                departamentos.map((d) => (
                                    <TableRow key={d.departamentoId}>
                                        <TableCell className="font-medium">
                                            {d.nombre}
                                        </TableCell>
                                        <TableCell>
                                            {d.cuentaContable}
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
                                                            abrirEditar(d)
                                                        }
                                                    >
                                                        <Pencil />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setEliminar(d)
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
                        <DialogTitle>Eliminar departamento</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro que desea eliminar el departamento{" "}
                            <strong>{eliminar?.nombre}</strong>? Esta acción se
                            puede revertir solo por un administrador.
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
