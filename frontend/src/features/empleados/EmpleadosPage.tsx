import { useEffect, useState, type FormEvent } from "react";
import type { CreateEmpleadoDto, Empleado } from "./Empleados.types";
import type { Departamento } from "../departamentos/Departamentos.types";
import { empleadosApi } from "./Empleados.api";
import { departamentosApi } from "../departamentos/Departamentos.api";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  PlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  Loader2,
} from "lucide-react";
import { formatMoneda } from "../../utils/formatters";

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
  diasLaborados: 30,
  departamentoId: 0,
};

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [form, setForm] = useState<CreateEmpleadoDto>(FORM_INICIAL);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [empleadosData, departamentosData] = await Promise.all([
        empleadosApi.getAll(),
        departamentosApi.getAll(),
      ]);
      setEmpleados(empleadosData);
      setDepartamentos(departamentosData);
    } catch {
      setError("No se pudieron cargar los datos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function abrirNuevo() {
    setEditId(null);
    setForm(FORM_INICIAL);
    setError("");
    setOpen(true);
  }

  function abrirEditar(e: Empleado) {
    setEditId(e.empleadoId);
    setForm({
      codigoEmpleado: e.codigoEmpleado,
      nombres: e.nombres,
      apellidos: e.apellidos,
      dpi: e.dpi,
      nit: e.nit ?? "",
      fechaNacimiento: e.fechaNacimiento.split("T")[0],
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
      fechaIngreso: e.fechaIngreso.split("T")[0],
      puesto: e.puesto,
      salarioBase: e.salarioBase,
      diasLaborados: e.diasLaborados,
      departamentoId: e.departamento?.departamentoId ?? 0,
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
        await empleadosApi.update(editId, form);
      } else {
        await empleadosApi.create(form);
      }
      setOpen(false);
      await cargarDatos();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const mensaje = axiosError.response?.data?.message;
      setError(
        Array.isArray(mensaje)
          ? mensaje.join(", ")
          : (mensaje ?? "No se pudo guardar el empleado. Revisa los datos."),
      );
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(id: number) {
    if (!confirm("¿Dar de baja a este empleado?")) return;
    await empleadosApi.remove(id);
    await cargarDatos();
  }

  function set<K extends keyof CreateEmpleadoDto>(
    key: K,
    value: CreateEmpleadoDto[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Empleados</CardTitle>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button onClick={abrirNuevo}>
                <PlusIcon />
                Nuevo empleado
              </Button>
            }
          />
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editId ? "Editar empleado" : "Nuevo empleado"}
                </DialogTitle>
                <DialogDescription>
                  {editId
                    ? "Actualiza los datos del colaborador"
                    : "Registra un nuevo colaborador en la nómina"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* DATOS PERSONALES */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Datos personales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="codigoEmpleado">Código</Label>
                      <Input
                        id="codigoEmpleado"
                        value={form.codigoEmpleado}
                        onChange={(e) => set("codigoEmpleado", e.target.value)}
                        placeholder="EMP-001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombres">Nombres</Label>
                      <Input
                        id="nombres"
                        value={form.nombres}
                        onChange={(e) => set("nombres", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellidos">Apellidos</Label>
                      <Input
                        id="apellidos"
                        value={form.apellidos}
                        onChange={(e) => set("apellidos", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dpi">DPI</Label>
                      <Input
                        id="dpi"
                        value={form.dpi}
                        onChange={(e) => set("dpi", e.target.value)}
                        maxLength={13}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nit">NIT (opcional)</Label>
                      <Input
                        id="nit"
                        value={form.nit}
                        onChange={(e) => set("nit", e.target.value)}
                        maxLength={15}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fechaNacimiento">
                        Fecha de nacimiento
                      </Label>
                      <Input
                        id="fechaNacimiento"
                        type="date"
                        value={form.fechaNacimiento}
                        onChange={(e) => set("fechaNacimiento", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="genero">Género</Label>
                      <Select
                        value={form.genero}
                        onValueChange={(v) => set("genero", v as string)}
                      >
                        <SelectTrigger id="genero">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MASCULINO">Masculino</SelectItem>
                          <SelectItem value="FEMENINO">Femenino</SelectItem>
                          <SelectItem value="OTRO">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estadoCivil">Estado civil</Label>
                      <Select
                        value={form.estadoCivil}
                        onValueChange={(v) => set("estadoCivil", v as string)}
                      >
                        <SelectTrigger id="estadoCivil">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SOLTERO">Soltero</SelectItem>
                          <SelectItem value="CASADO">Casado</SelectItem>
                          <SelectItem value="DIVORCIADO">Divorciado</SelectItem>
                          <SelectItem value="VIUDO">Viudo</SelectItem>
                          <SelectItem value="UNION_LIBRE">
                            Unión libre
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* CONTACTO */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Contacto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        value={form.direccion}
                        onChange={(e) => set("direccion", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefonoMovil">Teléfono móvil</Label>
                      <Input
                        id="telefonoMovil"
                        value={form.telefonoMovil}
                        onChange={(e) => set("telefonoMovil", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="correoPersonal">Correo personal</Label>
                      <Input
                        id="correoPersonal"
                        type="email"
                        value={form.correoPersonal}
                        onChange={(e) => set("correoPersonal", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="correoCorporativo">
                        Correo corporativo
                      </Label>
                      <Input
                        id="correoCorporativo"
                        type="email"
                        value={form.correoCorporativo}
                        onChange={(e) =>
                          set("correoCorporativo", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactoEmergenciaNombre">
                        Contacto de emergencia
                      </Label>
                      <Input
                        id="contactoEmergenciaNombre"
                        value={form.contactoEmergenciaNombre}
                        onChange={(e) =>
                          set("contactoEmergenciaNombre", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactoEmergenciaTelefono">
                        Teléfono de emergencia
                      </Label>
                      <Input
                        id="contactoEmergenciaTelefono"
                        value={form.contactoEmergenciaTelefono}
                        onChange={(e) =>
                          set("contactoEmergenciaTelefono", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </section>

                <Separator />

                {/* DATOS BANCARIOS */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Datos bancarios
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="banco">Banco</Label>
                      <Input
                        id="banco"
                        value={form.banco}
                        onChange={(e) => set("banco", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipoCuenta">Tipo de cuenta</Label>
                      <Select
                        value={form.tipoCuenta}
                        onValueChange={(v) => set("tipoCuenta", v as string)}
                      >
                        <SelectTrigger id="tipoCuenta">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MONETARIA">Monetaria</SelectItem>
                          <SelectItem value="AHORRO">Ahorro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numeroCuenta">Número de cuenta</Label>
                      <Input
                        id="numeroCuenta"
                        value={form.numeroCuenta}
                        onChange={(e) => set("numeroCuenta", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </section>

                <Separator />

                {/* DATOS LABORALES */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Datos laborales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="puesto">Puesto</Label>
                      <Input
                        id="puesto"
                        value={form.puesto}
                        onChange={(e) => set("puesto", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="departamentoId">Departamento</Label>
                      <Select
                        value={
                          form.departamentoId
                            ? String(form.departamentoId)
                            : undefined
                        }
                        onValueChange={(v) => set("departamentoId", Number(v))}
                      >
                        <SelectTrigger id="departamentoId">
                          <SelectValue placeholder="Selecciona" />
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
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fechaIngreso">Fecha de ingreso</Label>
                      <Input
                        id="fechaIngreso"
                        type="date"
                        value={form.fechaIngreso}
                        onChange={(e) => set("fechaIngreso", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salarioBase">Salario base</Label>
                      <Input
                        id="salarioBase"
                        type="number"
                        step="0.01"
                        value={form.salarioBase || ""}
                        onChange={(e) =>
                          set("salarioBase", Number(e.target.value))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diasLaborados">Días laborados</Label>
                      <Input
                        id="diasLaborados"
                        type="number"
                        value={form.diasLaborados}
                        onChange={(e) =>
                          set("diasLaborados", Number(e.target.value))
                        }
                        required
                      />
                    </div>
                  </div>
                </section>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
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
                    "Crear empleado"
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
                <TableHead>Departamento</TableHead>
                <TableHead>Puesto</TableHead>
                <TableHead>Salario Base</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {empleados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No hay empleados registrados
                  </TableCell>
                </TableRow>
              ) : (
                empleados.map((e) => (
                  <TableRow key={e.empleadoId}>
                    <TableCell className="font-mono text-xs">
                      {e.codigoEmpleado}
                    </TableCell>
                    <TableCell>
                      {e.nombres} {e.apellidos}
                    </TableCell>
                    <TableCell>{e.departamento?.nombre ?? "-"}</TableCell>
                    <TableCell>{e.puesto}</TableCell>
                    <TableCell>{formatMoneda(e.salarioBase)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon">
                              <MoreHorizontalIcon />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => abrirEditar(e)}>
                            <PencilIcon />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleEliminar(e.empleadoId)}
                          >
                            <Trash2Icon />
                            Dar de baja
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
    </Card>
  );
}
