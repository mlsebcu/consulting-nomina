import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
    Loader2,
    MoreHorizontalIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon,
} from "lucide-react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
import { formatMoneda } from "@/utils/formatters";
import { departamentosApi } from "../departamentos/Departamentos.api";
import type { Departamento } from "../departamentos/Departamentos.types";
import { empleadosApi } from "./Empleados.api";
import {
    ESTADOS_CIVILES,
    GENEROS,
    TIPOS_CUENTA,
    type CreateEmpleadoDto,
    type Empleado,
} from "./Empleados.types";

const DIAS_MES = 30;
const DPI_LONGITUD = 13;

const FORM_INICIAL: CreateEmpleadoDto = {
    codigoEmpleado: "",
    nombres: "",
    apellidos: "",
    dpi: "",
    nit: "",
    fechaNacimiento: "",
    genero: "MASCULINO",
    estadoCivil: "SOLTERO",
    direccion: "",
    telefonoMovil: "",
    correoPersonal: "",
    correoCorporativo: "",
    contactoEmergenciaNombre: "",
    contactoEmergenciaTelefono: "",
    banco: "",
    tipoCuenta: "MONETARIA",
    numeroCuenta: "",
    fechaIngreso: "",
    puesto: "",
    salarioBase: 0,
    diasLaborados: DIAS_MES,
    departamentoId: 0,
};

function aFormulario(e: Empleado): CreateEmpleadoDto {
    return {
        codigoEmpleado: e.codigoEmpleado,
        nombres: e.nombres,
        apellidos: e.apellidos,
        dpi: e.dpi,
        nit: e.nit ?? "",
        fechaNacimiento: e.fechaNacimiento.slice(0, 10),
        genero: e.genero,
        estadoCivil: e.estadoCivil,
        direccion: e.direccion,
        telefonoMovil: e.telefonoMovil,
        correoPersonal: e.correoPersonal,
        correoCorporativo: e.correoCorporativo,
        contactoEmergenciaNombre: e.contactoEmergenciaNombre,
        contactoEmergenciaTelefono: e.contactoEmergenciaTelefono,
        banco: e.banco,
        tipoCuenta: e.tipoCuenta,
        numeroCuenta: e.numeroCuenta,
        fechaIngreso: e.fechaIngreso.slice(0, 10),
        puesto: e.puesto,
        salarioBase: e.salarioBase,
        diasLaborados: e.diasLaborados,
        departamentoId: e.departamentoId,
    };
}

function Campo({
    id,
    label,
    className,
    children,
}: {
    id: string;
    label: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={`space-y-2 ${className ?? ""}`}>
            <Label htmlFor={id}>{label}</Label>
            {children}
        </div>
    );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">{titulo}</h3>
            {children}
        </section>
    );
}

export default function EmpleadosPage() {
    const { esAdmin } = useAuth();
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [form, setForm] = useState<CreateEmpleadoDto>(FORM_INICIAL);
    const [busqueda, setBusqueda] = useState("");
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [aEliminar, setAEliminar] = useState<Empleado | null>(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    async function cargarDatos() {
        try {
            const [empleadosData, departamentosData] = await Promise.all([
                empleadosApi.getAll(),
                departamentosApi.getAll(),
            ]);
            setEmpleados(empleadosData);
            setDepartamentos(departamentosData);
        } catch (err) {
            toast.error(mensajeError(err, "No se pudieron cargar los empleados."));
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        void cargarDatos();
    }, []);

    const filtrados = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();
        if (!termino) return empleados;
        return empleados.filter((e) =>
            [e.codigoEmpleado, e.nombres, e.apellidos, e.puesto, e.departamento?.nombre]
                .join(" ")
                .toLowerCase()
                .includes(termino),
        );
    }, [empleados, busqueda]);

    const opcionesDepartamento = Object.fromEntries(
        departamentos.map((d) => [String(d.departamentoId), d.nombre]),
    );

    function abrirFormulario(empleado?: Empleado) {
        setEditId(empleado?.empleadoId ?? null);
        setForm(empleado ? aFormulario(empleado) : FORM_INICIAL);
        setError("");
        setOpen(true);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!form.departamentoId) {
            setError("Seleccione el departamento del empleado.");
            return;
        }
        setError("");
        setGuardando(true);
        try {
            const datos = { ...form, nit: form.nit || undefined };
            if (editId) {
                await empleadosApi.update(editId, datos);
                toast.success("Empleado actualizado");
            } else {
                await empleadosApi.create(datos);
                toast.success("Empleado registrado");
            }
            setOpen(false);
            await cargarDatos();
        } catch (err) {
            setError(mensajeError(err, "No se pudo guardar el empleado. Revise los datos."));
        } finally {
            setGuardando(false);
        }
    }

    async function confirmarBaja() {
        if (!aEliminar) return;
        setGuardando(true);
        try {
            await empleadosApi.remove(aEliminar.empleadoId);
            toast.success(`${aEliminar.nombres} ${aEliminar.apellidos} fue dado de baja`);
            setAEliminar(null);
            await cargarDatos();
        } catch (err) {
            toast.error(mensajeError(err, "No se pudo dar de baja al empleado."));
        } finally {
            setGuardando(false);
        }
    }

    function set<K extends keyof CreateEmpleadoDto>(key: K, value: CreateEmpleadoDto[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>
                    Empleados
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {empleados.length} activos
                    </span>
                </CardTitle>
                <div className="flex gap-2">
                    <div className="relative">
                        <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre, código o puesto"
                            aria-label="Buscar empleados"
                            className="w-full pl-8 sm:w-72"
                        />
                    </div>
                    <Button onClick={() => abrirFormulario()}>
                        <PlusIcon />
                        Nuevo empleado
                    </Button>
                </div>
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
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Departamento</TableHead>
                                <TableHead>Puesto</TableHead>
                                <TableHead className="text-right">Salario base</TableHead>
                                <TableHead className="w-12">
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtrados.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        {busqueda
                                            ? "Ningún empleado coincide con la búsqueda"
                                            : "No hay empleados registrados"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtrados.map((e) => (
                                    <TableRow key={e.empleadoId}>
                                        <TableCell className="font-mono text-xs">
                                            {e.codigoEmpleado}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {e.nombres} {e.apellidos}
                                        </TableCell>
                                        <TableCell>{e.departamento?.nombre ?? "-"}</TableCell>
                                        <TableCell>{e.puesto}</TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatMoneda(e.salarioBase)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Acciones para ${e.nombres}`}
                                                        >
                                                            <MoreHorizontalIcon />
                                                        </Button>
                                                    }
                                                />
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => abrirFormulario(e)}
                                                    >
                                                        <PencilIcon />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    {esAdmin && (
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() => setAEliminar(e)}
                                                        >
                                                            <Trash2Icon />
                                                            Dar de baja
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
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editId ? "Editar empleado" : "Nuevo empleado"}
                            </DialogTitle>
                            <DialogDescription>
                                Los campos de salario y días laborados se usan en el cálculo de
                                la nómina del período.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            <Seccion titulo="Datos personales">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Campo id="codigoEmpleado" label="Código">
                                        <Input
                                            id="codigoEmpleado"
                                            value={form.codigoEmpleado}
                                            onChange={(e) => set("codigoEmpleado", e.target.value)}
                                            placeholder="EMP-011"
                                            required
                                        />
                                    </Campo>
                                    <Campo id="nombres" label="Nombres">
                                        <Input
                                            id="nombres"
                                            value={form.nombres}
                                            onChange={(e) => set("nombres", e.target.value)}
                                            required
                                        />
                                    </Campo>
                                    <Campo id="apellidos" label="Apellidos">
                                        <Input
                                            id="apellidos"
                                            value={form.apellidos}
                                            onChange={(e) => set("apellidos", e.target.value)}
                                            required
                                        />
                                    </Campo>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Campo id="dpi" label="DPI">
                                        <Input
                                            id="dpi"
                                            value={form.dpi}
                                            onChange={(e) =>
                                                set("dpi", e.target.value.replace(/\D/g, ""))
                                            }
                                            inputMode="numeric"
                                            minLength={DPI_LONGITUD}
                                            maxLength={DPI_LONGITUD}
                                            placeholder="13 dígitos"
                                            required
                                        />
                                    </Campo>
                                    <Campo id="nit" label="NIT (opcional)">
                                        <Input
                                            id="nit"
                                            value={form.nit}
                                            onChange={(e) => set("nit", e.target.value)}
                                            maxLength={15}
                                        />
                                    </Campo>
                                    <Campo id="fechaNacimiento" label="Fecha de nacimiento">
                                        <Input
                                            id="fechaNacimiento"
                                            type="date"
                                            value={form.fechaNacimiento}
                                            onChange={(e) => set("fechaNacimiento", e.target.value)}
                                            required
                                        />
                                    </Campo>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Campo id="genero" label="Género">
                                        <Select
                                            items={GENEROS}
                                            value={form.genero}
                                            onValueChange={(v) => v && set("genero", v)}
                                        >
                                            <SelectTrigger id="genero" className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(GENEROS).map(([valor, etiqueta]) => (
                                                    <SelectItem key={valor} value={valor}>
                                                        {etiqueta}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Campo>
                                    <Campo id="estadoCivil" label="Estado civil">
                                        <Select
                                            items={ESTADOS_CIVILES}
                                            value={form.estadoCivil}
                                            onValueChange={(v) => v && set("estadoCivil", v)}
                                        >
                                            <SelectTrigger id="estadoCivil" className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(ESTADOS_CIVILES).map(
                                                    ([valor, etiqueta]) => (
                                                        <SelectItem key={valor} value={valor}>
                                                            {etiqueta}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </Campo>
                                </div>
                            </Seccion>

                            <Separator />

                            <Seccion titulo="Contacto">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Campo id="direccion" label="Dirección" className="md:col-span-2">
                                        <Input
                                            id="direccion"
                                            value={form.direccion}
                                            onChange={(e) => set("direccion", e.target.value)}
                                            required
                                        />
                                    </Campo>
                                    <Campo id="telefonoMovil" label="Teléfono móvil">
                                        <Input
                                            id="telefonoMovil"
                                            type="tel"
                                            value={form.telefonoMovil}
                                            onChange={(e) => set("telefonoMovil", e.target.value)}
                                            required
                                        />
                                    </Campo>
                                    <Campo id="correoPersonal" label="Correo personal">
                                        <Input
                                            id="correoPersonal"
                                            type="email"
                                            value={form.correoPersonal}
                                            onChange={(e) => set("correoPersonal", e.target.value)}
                                            required
                                        />
                                    </Campo>
                                    <Campo id="correoCorporativo" label="Correo corporativo">
                                        <Input
                                            id="correoCorporativo"
                                            type="email"
                                            value={form.correoCorporativo}
                                            onChange={(e) => set("correoCorporativo", e.target.value)}
                                            required
                                        />
                                    </Campo>
                                    <Campo id="contactoEmergenciaNombre" label="Contacto de emergencia">
                                        <Input
                                            id="contactoEmergenciaNombre"
                                            value={form.contactoEmergenciaNombre}
                                            onChange={(e) =>
                                                set("contactoEmergenciaNombre", e.target.value)
                                            }
                                            required
                                        />
                                    </Campo>
                                    <Campo id="contactoEmergenciaTelefono" label="Teléfono de emergencia">
                                        <Input
                                            id="contactoEmergenciaTelefono"
                                            type="tel"
                                            value={form.contactoEmergenciaTelefono}
                                            onChange={(e) =>
                                                set("contactoEmergenciaTelefono", e.target.value)
                                            }
                                            required
                                        />
                                    </Campo>
                                </div>
                            </Seccion>

                            <Separator />

                            <Seccion titulo="Datos bancarios">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Campo id="banco" label="Banco">
                                        <Input
                                            id="banco"
                                            value={form.banco}
                                            onChange={(e) => set("banco", e.target.value)}
                                            required
                                        />
                                    </Campo>
                                    <Campo id="tipoCuenta" label="Tipo de cuenta">
                                        <Select
                                            items={TIPOS_CUENTA}
                                            value={form.tipoCuenta}
                                            onValueChange={(v) => v && set("tipoCuenta", v)}
                                        >
                                            <SelectTrigger id="tipoCuenta" className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(TIPOS_CUENTA).map(
                                                    ([valor, etiqueta]) => (
                                                        <SelectItem key={valor} value={valor}>
                                                            {etiqueta}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </Campo>
                                    <Campo id="numeroCuenta" label="Número de cuenta">
                                        <Input
                                            id="numeroCuenta"
                                            value={form.numeroCuenta}
                                            onChange={(e) => set("numeroCuenta", e.target.value)}
                                            required
                                        />
                                    </Campo>
                                </div>
                            </Seccion>

                            <Separator />

                            <Seccion titulo="Datos laborales">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Campo id="puesto" label="Puesto" className="md:col-span-2">
                                        <Input
                                            id="puesto"
                                            value={form.puesto}
                                            onChange={(e) => set("puesto", e.target.value)}
                                            required
                                        />
                                    </Campo>
                                    <Campo id="departamentoId" label="Departamento">
                                        <Select
                                            items={opcionesDepartamento}
                                            value={form.departamentoId ? String(form.departamentoId) : ""}
                                            onValueChange={(v) => v && set("departamentoId", Number(v))}
                                        >
                                            <SelectTrigger id="departamentoId" className="w-full">
                                                <SelectValue placeholder="Seleccione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departamentos.map((d) => (
                                                    <SelectItem
                                                        key={d.departamentoId}
                                                        value={String(d.departamentoId)}
                                                    >
                                                        {d.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Campo>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Campo id="fechaIngreso" label="Fecha de ingreso">
                                        <Input
                                            id="fechaIngreso"
                                            type="date"
                                            value={form.fechaIngreso}
                                            onChange={(e) => set("fechaIngreso", e.target.value)}
                                            required
                                        />
                                    </Campo>
                                    <Campo id="salarioBase" label="Salario base mensual (Q)">
                                        <Input
                                            id="salarioBase"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={form.salarioBase || ""}
                                            onChange={(e) => set("salarioBase", Number(e.target.value))}
                                            required
                                        />
                                    </Campo>
                                    <Campo id="diasLaborados" label="Días laborados en el mes">
                                        <Input
                                            id="diasLaborados"
                                            type="number"
                                            min={0}
                                            max={DIAS_MES}
                                            value={form.diasLaborados}
                                            onChange={(e) => set("diasLaborados", Number(e.target.value))}
                                            required
                                        />
                                    </Campo>
                                </div>
                            </Seccion>

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
                                {editId ? "Guardar cambios" : "Registrar empleado"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!aEliminar}
                titulo="Dar de baja al empleado"
                descripcion={
                    <>
                        {aEliminar?.nombres} {aEliminar?.apellidos} dejará de incluirse en los
                        próximos cálculos de nómina. Las nóminas ya calculadas no se modifican.
                    </>
                }
                textoConfirmar="Dar de baja"
                destructivo
                procesando={guardando}
                onConfirmar={confirmarBaja}
                onCancelar={() => setAEliminar(null)}
            />
        </Card>
    );
}
