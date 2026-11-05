import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { mensajeError } from "@/utils/errores";
import { departamentosApi } from "./Departamentos.api";
import type { CreateDepartamentoDto, Departamento } from "./Departamentos.types";

const FORM_INICIAL: CreateDepartamentoDto = { nombre: "", cuentaContable: "" };
const CUENTA_CONTABLE_PATTERN = "\\d{4}-\\d{2}";

export default function DepartamentosPage() {
    const { esAdmin } = useAuth();
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [form, setForm] = useState<CreateDepartamentoDto>(FORM_INICIAL);
    const [editId, setEditId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [eliminar, setEliminar] = useState<Departamento | null>(null);

    async function cargar() {
        try {
            setDepartamentos(await departamentosApi.getAll());
        } catch (err) {
            toast.error(mensajeError(err, "No se pudieron cargar los departamentos."));
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        void cargar();
    }, []);

    function abrirFormulario(d?: Departamento) {
        setEditId(d?.departamentoId ?? null);
        setForm(d ? { nombre: d.nombre, cuentaContable: d.cuentaContable } : FORM_INICIAL);
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
                toast.success("Departamento actualizado");
            } else {
                await departamentosApi.create(form);
                toast.success("Departamento creado");
            }
            setOpen(false);
            await cargar();
        } catch (err) {
            setError(mensajeError(err, "No se pudo guardar el departamento."));
        } finally {
            setGuardando(false);
        }
    }

    async function confirmarEliminar() {
        if (!eliminar) return;
        setGuardando(true);
        try {
            await departamentosApi.remove(eliminar.departamentoId);
            toast.success("Departamento eliminado");
            await cargar();
        } catch (err) {
            toast.error(mensajeError(err, "No se pudo eliminar el departamento."));
        } finally {
            setGuardando(false);
            setEliminar(null);
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Departamentos</CardTitle>
                {esAdmin && (
                    <Button onClick={() => abrirFormulario()}>
                        <Plus />
                        Nuevo departamento
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
                                <TableHead>Nombre</TableHead>
                                <TableHead>Cuenta contable de gasto</TableHead>
                                {esAdmin && (
                                    <TableHead className="w-12">
                                        <span className="sr-only">Acciones</span>
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departamentos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                                        No hay departamentos registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                departamentos.map((d) => (
                                    <TableRow key={d.departamentoId}>
                                        <TableCell className="font-medium">{d.nombre}</TableCell>
                                        <TableCell className="font-mono text-xs">{d.cuentaContable}</TableCell>
                                        {esAdmin && (
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        render={
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label={`Acciones para ${d.nombre}`}
                                                            >
                                                                <MoreHorizontal />
                                                            </Button>
                                                        }
                                                    />
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => abrirFormulario(d)}>
                                                            <Pencil />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() => setEliminar(d)}
                                                        >
                                                            <Trash2 />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editId ? "Editar departamento" : "Nuevo departamento"}</DialogTitle>
                            <DialogDescription>
                                La cuenta contable se usa como cargo del gasto de nómina en la póliza.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
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
                            <div className="space-y-2">
                                <Label htmlFor="cuentaContable">Cuenta contable</Label>
                                <Input
                                    id="cuentaContable"
                                    value={form.cuentaContable}
                                    onChange={(e) => setForm({ ...form, cuentaContable: e.target.value })}
                                    placeholder="5101-10"
                                    pattern={CUENTA_CONTABLE_PATTERN}
                                    title="Formato 0000-00"
                                    required
                                />
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
                                {editId ? "Guardar cambios" : "Crear departamento"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!eliminar}
                titulo="Eliminar departamento"
                descripcion={`Se eliminará ${eliminar?.nombre ?? ""}. No es posible si tiene empleados activos asignados.`}
                textoConfirmar="Eliminar"
                destructivo
                procesando={guardando}
                onConfirmar={confirmarEliminar}
                onCancelar={() => setEliminar(null)}
            />
        </Card>
    );
}
