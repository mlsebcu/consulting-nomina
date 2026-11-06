import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
    KeyRoundIcon,
    PencilIcon,
    Loader2,
    MoreHorizontal,
    Plus,
    ShieldIcon,
    UserCheckIcon,
    UserXIcon,
} from "lucide-react";
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
import type { Rol } from "@/lib/sesion";
import { mensajeError } from "@/utils/errores";
import { formatFecha } from "@/utils/formatters";
import { usuariosApi, type CreateUsuarioDto, type Usuario } from "./Usuarios.api";

const ROLES: Record<Rol, string> = { ADMIN: "Administrador", RRHH: "Recursos Humanos" };
const PASSWORD_MIN_LENGTH = 8;
const FORM_INICIAL: CreateUsuarioDto = {
    nombreUsuario: "",
    nombreCompleto: "",
    rol: "RRHH",
    password: "",
};

type Accion = { tipo: "estado" | "rol"; usuario: Usuario };

export default function UsuariosPage() {
    const { usuario: sesion } = useAuth();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [form, setForm] = useState<CreateUsuarioDto>(FORM_INICIAL);
    const [abrirNuevo, setAbrirNuevo] = useState(false);
    const [passwordDe, setPasswordDe] = useState<Usuario | null>(null);
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [editarNombre, setEditarNombre] = useState<Usuario | null>(null);
    const [nombre, setNombre] = useState("");
    const [accion, setAccion] = useState<Accion | null>(null);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    async function cargar() {
        try {
            setUsuarios(await usuariosApi.getAll());
        } catch (err) {
            toast.error(mensajeError(err, "No se pudieron cargar los usuarios."));
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        void cargar();
    }, []);

    async function crear(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setGuardando(true);
        try {
            await usuariosApi.create({
                ...form,
                nombreUsuario: form.nombreUsuario.trim().toLowerCase(),
                nombreCompleto: form.nombreCompleto.trim(),
            });
            toast.success(`Usuario ${form.nombreUsuario} creado`);
            setAbrirNuevo(false);
            await cargar();
        } catch (err) {
            setError(mensajeError(err, "No se pudo crear el usuario."));
        } finally {
            setGuardando(false);
        }
    }

    async function guardarPassword(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!passwordDe) return;
        setError("");
        setGuardando(true);
        try {
            await usuariosApi.cambiarPassword(passwordDe.usuarioId, nuevaPassword);
            toast.success(`Contraseña de ${passwordDe.nombreUsuario} actualizada`);
            setPasswordDe(null);
        } catch (err) {
            setError(mensajeError(err, "No se pudo cambiar la contraseña."));
        } finally {
            setGuardando(false);
        }
    }

    async function guardarNombre(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editarNombre) return;
        setError("");
        setGuardando(true);
        try {
            await usuariosApi.update(editarNombre.usuarioId, { nombreCompleto: nombre.trim() });
            toast.success("Nombre actualizado");
            setEditarNombre(null);
            await cargar();
        } catch (err) {
            setError(mensajeError(err, "No se pudo actualizar el nombre."));
        } finally {
            setGuardando(false);
        }
    }

    async function confirmarAccion() {
        if (!accion) return;
        const { tipo, usuario } = accion;
        const cambio =
            tipo === "estado"
                ? { activo: !usuario.activo }
                : { rol: (usuario.rol === "ADMIN" ? "RRHH" : "ADMIN") as Rol };
        setGuardando(true);
        try {
            await usuariosApi.update(usuario.usuarioId, cambio);
            toast.success(`Usuario ${usuario.nombreUsuario} actualizado`);
            await cargar();
        } catch (err) {
            toast.error(mensajeError(err, "No se pudo actualizar el usuario."));
        } finally {
            setGuardando(false);
            setAccion(null);
        }
    }

    const descripcionAccion = accion
        ? accion.tipo === "estado"
            ? accion.usuario.activo
                ? `${accion.usuario.nombreUsuario} ya no podrá iniciar sesión. Puede reactivarlo después.`
                : `${accion.usuario.nombreUsuario} podrá volver a iniciar sesión.`
            : `${accion.usuario.nombreUsuario} pasará a tener el rol ${
                  ROLES[accion.usuario.rol === "ADMIN" ? "RRHH" : "ADMIN"]
              }.`
        : "";

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Usuarios del sistema</CardTitle>
                <Button
                    onClick={() => {
                        setForm(FORM_INICIAL);
                        setError("");
                        setAbrirNuevo(true);
                    }}
                >
                    <Plus />
                    Nuevo usuario
                </Button>
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
                                <TableHead>Usuario</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Creado</TableHead>
                                <TableHead className="w-12">
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usuarios.map((u) => {
                                const esPropio = u.nombreUsuario === sesion?.nombreUsuario;
                                return (
                                    <TableRow key={u.usuarioId}>
                                        <TableCell className="font-medium">{u.nombreCompleto}</TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {u.nombreUsuario}
                                            {esPropio && (
                                                <span className="ml-2 text-xs text-muted-foreground">(usted)</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{ROLES[u.rol]}</TableCell>
                                        <TableCell>
                                            <Badge variant={u.activo ? "secondary" : "outline"}>
                                                {u.activo ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatFecha(u.fechaCreacion)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Acciones para ${u.nombreUsuario}`}
                                                        >
                                                            <MoreHorizontal />
                                                        </Button>
                                                    }
                                                />
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setNombre(u.nombreCompleto);
                                                            setError("");
                                                            setEditarNombre(u);
                                                        }}
                                                    >
                                                        <PencilIcon />
                                                        Editar nombre
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setNuevaPassword("");
                                                            setError("");
                                                            setPasswordDe(u);
                                                        }}
                                                    >
                                                        <KeyRoundIcon />
                                                        Cambiar contraseña
                                                    </DropdownMenuItem>
                                                    {!esPropio && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => setAccion({ tipo: "rol", usuario: u })}
                                                            >
                                                                <ShieldIcon />
                                                                Cambiar a {ROLES[u.rol === "ADMIN" ? "RRHH" : "ADMIN"]}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                variant={u.activo ? "destructive" : "default"}
                                                                onClick={() => setAccion({ tipo: "estado", usuario: u })}
                                                            >
                                                                {u.activo ? <UserXIcon /> : <UserCheckIcon />}
                                                                {u.activo ? "Desactivar" : "Reactivar"}
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={abrirNuevo} onOpenChange={setAbrirNuevo}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={crear}>
                        <DialogHeader>
                            <DialogTitle>Nuevo usuario</DialogTitle>
                            <DialogDescription>
                                Comparta la contraseña inicial con el usuario por un medio seguro.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombreCompleto">Nombre completo</Label>
                                <Input
                                    id="nombreCompleto"
                                    value={form.nombreCompleto}
                                    onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
                                    placeholder="Juan Pérez"
                                    maxLength={150}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nombreUsuario">Usuario</Label>
                                <Input
                                    id="nombreUsuario"
                                    value={form.nombreUsuario}
                                    onChange={(e) => setForm({ ...form, nombreUsuario: e.target.value })}
                                    placeholder="jperez"
                                    autoComplete="off"
                                    minLength={3}
                                    maxLength={50}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Minúsculas, números, punto o guion.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rol">Rol</Label>
                                <Select
                                    items={ROLES}
                                    value={form.rol}
                                    onValueChange={(v) => v && setForm({ ...form, rol: v })}
                                >
                                    <SelectTrigger id="rol" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(ROLES).map(([valor, etiqueta]) => (
                                            <SelectItem key={valor} value={valor}>
                                                {etiqueta}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña inicial</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    autoComplete="new-password"
                                    minLength={PASSWORD_MIN_LENGTH}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Mínimo {PASSWORD_MIN_LENGTH} caracteres.
                                </p>
                            </div>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAbrirNuevo(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={guardando}>
                                {guardando && <Loader2 className="animate-spin" />}
                                Crear usuario
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!passwordDe} onOpenChange={(abierto) => !abierto && setPasswordDe(null)}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={guardarPassword}>
                        <DialogHeader>
                            <DialogTitle>Cambiar contraseña</DialogTitle>
                            <DialogDescription>
                                Nueva contraseña para {passwordDe?.nombreUsuario}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nuevaPassword">Nueva contraseña</Label>
                                <Input
                                    id="nuevaPassword"
                                    type="password"
                                    value={nuevaPassword}
                                    onChange={(e) => setNuevaPassword(e.target.value)}
                                    autoComplete="new-password"
                                    minLength={PASSWORD_MIN_LENGTH}
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
                            <Button type="button" variant="outline" onClick={() => setPasswordDe(null)}>
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

            <Dialog open={!!editarNombre} onOpenChange={(abierto) => !abierto && setEditarNombre(null)}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={guardarNombre}>
                        <DialogHeader>
                            <DialogTitle>Editar nombre</DialogTitle>
                            <DialogDescription>
                                Nombre que se muestra para {editarNombre?.nombreUsuario}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="editarNombreCompleto">Nombre completo</Label>
                                <Input
                                    id="editarNombreCompleto"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    maxLength={150}
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
                            <Button type="button" variant="outline" onClick={() => setEditarNombre(null)}>
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
                open={!!accion}
                titulo={
                    accion?.tipo === "rol"
                        ? "Cambiar rol"
                        : accion?.usuario.activo
                          ? "Desactivar usuario"
                          : "Reactivar usuario"
                }
                descripcion={descripcionAccion}
                destructivo={accion?.tipo === "estado" && accion.usuario.activo}
                procesando={guardando}
                onConfirmar={confirmarAccion}
                onCancelar={() => setAccion(null)}
            />
        </Card>
    );
}
