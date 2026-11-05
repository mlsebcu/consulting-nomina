import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import type { Concepto, ConceptoReglaFiscal, CreateReglaFiscalDto } from "../Conceptos.types";

const PAIS_POR_DEFECTO = "GTM";
const IMPUESTOS = { IGSS: "IGSS (cuota laboral)", ISR: "ISR (renta)" } as const;

function formularioInicial(): CreateReglaFiscalDto {
    return {
        pais: PAIS_POR_DEFECTO,
        anio: new Date().getFullYear(),
        tipoImpuesto: "IGSS",
        esGravable: true,
        esBaseCalculo: true,
    };
}

interface Props {
    concepto: Concepto;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function SiNo({ valor }: { valor: boolean }) {
    return <Badge variant={valor ? "default" : "outline"}>{valor ? "Sí" : "No"}</Badge>;
}

export function ReglasFiscalesDialog({ concepto, open, onOpenChange }: Props) {
    const { esAdmin } = useAuth();
    const [reglas, setReglas] = useState<ConceptoReglaFiscal[]>([]);
    const [form, setForm] = useState<CreateReglaFiscalDto>(formularioInicial);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [eliminar, setEliminar] = useState<ConceptoReglaFiscal | null>(null);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const cargar = useCallback(async () => {
        try {
            setReglas(await conceptosApi.getReglasFiscales(concepto.conceptoId));
        } catch (err) {
            toast.error(mensajeError(err, "No se pudieron cargar las reglas fiscales."));
        } finally {
            setCargando(false);
        }
    }, [concepto.conceptoId]);

    useEffect(() => {
        if (open) void cargar();
    }, [open, cargar]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setGuardando(true);
        try {
            await conceptosApi.createReglaFiscal(concepto.conceptoId, form);
            toast.success("Regla fiscal agregada");
            setForm(formularioInicial());
            setMostrarForm(false);
            await cargar();
        } catch (err) {
            setError(mensajeError(err, "No se pudo guardar la regla fiscal."));
        } finally {
            setGuardando(false);
        }
    }

    async function confirmarEliminar() {
        if (!eliminar) return;
        setGuardando(true);
        try {
            await conceptosApi.removeReglaFiscal(concepto.conceptoId, eliminar.conceptoReglaFiscalId);
            toast.success("Regla fiscal eliminada");
            await cargar();
        } catch (err) {
            toast.error(mensajeError(err, "No se pudo eliminar la regla fiscal."));
        } finally {
            setGuardando(false);
            setEliminar(null);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Tratamiento fiscal: {concepto.nombre}</DialogTitle>
                    <DialogDescription>
                        Define por año si el concepto forma parte de la base del IGSS y si es renta
                        gravada para el ISR. Un concepto sin regla para el año no afecta impuestos.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {esAdmin && !mostrarForm && (
                        <Button variant="outline" size="sm" onClick={() => setMostrarForm(true)}>
                            <Plus />
                            Agregar regla
                        </Button>
                    )}

                    {mostrarForm && (
                        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-muted/30 p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="pais">País (ISO)</Label>
                                    <Input
                                        id="pais"
                                        value={form.pais}
                                        onChange={(e) => setForm({ ...form, pais: e.target.value.toUpperCase() })}
                                        minLength={3}
                                        maxLength={3}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="anio">Año</Label>
                                    <Input
                                        id="anio"
                                        type="number"
                                        value={form.anio}
                                        onChange={(e) => setForm({ ...form, anio: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tipoImpuesto">Impuesto</Label>
                                    <Select
                                        items={IMPUESTOS}
                                        value={form.tipoImpuesto}
                                        onValueChange={(v) => v && setForm({ ...form, tipoImpuesto: v })}
                                    >
                                        <SelectTrigger id="tipoImpuesto" className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(IMPUESTOS).map(([valor, etiqueta]) => (
                                                <SelectItem key={valor} value={valor}>
                                                    {etiqueta}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        className="size-4 accent-primary"
                                        checked={form.esBaseCalculo}
                                        onChange={(e) => setForm({ ...form, esBaseCalculo: e.target.checked })}
                                    />
                                    Forma parte de la base del IGSS
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        className="size-4 accent-primary"
                                        checked={form.esGravable}
                                        onChange={(e) => setForm({ ...form, esGravable: e.target.checked })}
                                    />
                                    Es renta gravada para ISR
                                </label>
                                <div className="space-y-2">
                                    <Label htmlFor="porcentajeExencion">Exención (%)</Label>
                                    <Input
                                        id="porcentajeExencion"
                                        type="number"
                                        min={0}
                                        max={100}
                                        step="0.01"
                                        value={form.porcentajeExencion ?? ""}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                porcentajeExencion: e.target.value ? Number(e.target.value) : undefined,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="limiteExencion">Tope de exención (Q)</Label>
                                    <Input
                                        id="limiteExencion"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={form.limiteExencion ?? ""}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                limiteExencion: e.target.value ? Number(e.target.value) : undefined,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setMostrarForm(false);
                                        setError("");
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" size="sm" disabled={guardando}>
                                    {guardando && <Loader2 className="animate-spin" />}
                                    Guardar regla
                                </Button>
                            </div>
                        </form>
                    )}

                    {cargando ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : reglas.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">
                            Este concepto no tiene reglas fiscales; no afecta IGSS ni ISR.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Año</TableHead>
                                    <TableHead>País</TableHead>
                                    <TableHead>Impuesto</TableHead>
                                    <TableHead>Base IGSS</TableHead>
                                    <TableHead>Gravado ISR</TableHead>
                                    <TableHead>Exención</TableHead>
                                    {esAdmin && <TableHead className="w-12" />}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reglas.map((r) => (
                                    <TableRow key={r.conceptoReglaFiscalId}>
                                        <TableCell>{r.anio}</TableCell>
                                        <TableCell className="font-mono text-xs">{r.pais}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{r.tipoImpuesto}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <SiNo valor={r.esBaseCalculo} />
                                        </TableCell>
                                        <TableCell>
                                            <SiNo valor={r.esGravable} />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {r.porcentajeExencion ? `${r.porcentajeExencion} %` : "-"}
                                        </TableCell>
                                        {esAdmin && (
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Eliminar regla"
                                                    onClick={() => setEliminar(r)}
                                                >
                                                    <Trash2 className="text-destructive" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                </DialogFooter>

                <ConfirmDialog
                    open={!!eliminar}
                    titulo="Eliminar regla fiscal"
                    descripcion={`La regla ${eliminar?.tipoImpuesto ?? ""} ${eliminar?.anio ?? ""} dejará de aplicarse en los próximos cálculos.`}
                    textoConfirmar="Eliminar"
                    destructivo
                    procesando={guardando}
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => setEliminar(null)}
                />
            </DialogContent>
        </Dialog>
    );
}
