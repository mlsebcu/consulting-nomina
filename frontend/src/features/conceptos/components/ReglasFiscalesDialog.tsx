import { useEffect, useState, type FormEvent } from "react";
import type {
    Concepto,
    ConceptoReglaFiscal,
    CreateReglaFiscalDto,
} from "../Conceptos.types";
import { conceptosApi } from "../Conceptos.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, X } from "lucide-react";

const FORM_INICIAL: CreateReglaFiscalDto = {
    pais: "GTM",
    anio: new Date().getFullYear(),
    tipoImpuesto: "ISR",
    esGravable: false,
    esBaseCalculo: false,
};

interface Props {
    concepto: Concepto;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReglasFiscalesDialog({ concepto, open, onOpenChange }: Props) {
    const [reglas, setReglas] = useState<ConceptoReglaFiscal[]>([]);
    const [form, setForm] = useState<CreateReglaFiscalDto>(FORM_INICIAL);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    async function cargar() {
        setCargando(true);
        try {
            setReglas(
                await conceptosApi.getReglasFiscales(concepto.conceptoId),
            );
        } catch {
            setError("No se pudieron cargar las reglas fiscales.");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        if (open) {
            cargar();
            setForm(FORM_INICIAL);
            setMostrarForm(false);
            setError("");
        }
    }, [open]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setGuardando(true);
        try {
            await conceptosApi.createReglaFiscal(concepto.conceptoId, form);
            setForm(FORM_INICIAL);
            setMostrarForm(false);
            await cargar();
        } catch (err: unknown) {
            const axiosError = err as {
                response?: { data?: { message?: string | string[] } };
            };
            const mensaje = axiosError.response?.data?.message;
            setError(
                Array.isArray(mensaje)
                    ? mensaje.join(", ")
                    : (mensaje ?? "No se pudo guardar la regla fiscal."),
            );
        } finally {
            setGuardando(false);
        }
    }

    async function handleEliminar(reglaId: number) {
        if (!confirm("¿Eliminar esta regla fiscal?")) return;
        try {
            await conceptosApi.removeReglaFiscal(concepto.conceptoId, reglaId);
            await cargar();
        } catch {
            alert("No se pudo eliminar la regla fiscal.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Reglas fiscales — {concepto.nombre}
                    </DialogTitle>
                    <DialogDescription>
                        Configure cómo tributa este concepto según país, año e
                        impuesto. Estas reglas determinan si el concepto es
                        gravable y si forma parte de la base de cálculo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!mostrarForm && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setMostrarForm(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva regla fiscal
                        </Button>
                    )}

                    {mostrarForm && (
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 border rounded-lg p-4 bg-muted/30"
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold">
                                    Nueva regla fiscal
                                </h4>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setMostrarForm(false);
                                        setForm(FORM_INICIAL);
                                        setError("");
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pais">País</Label>
                                    <Input
                                        id="pais"
                                        value={form.pais}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                pais: e.target.value.toUpperCase(),
                                            })
                                        }
                                        maxLength={3}
                                        placeholder="GTM"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="anio">Año</Label>
                                    <Input
                                        id="anio"
                                        type="number"
                                        value={form.anio}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                anio: Number(e.target.value),
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tipoImpuesto">
                                        Tipo de impuesto
                                    </Label>
                                    <Select
                                        value={form.tipoImpuesto}
                                        onValueChange={(v) =>
                                            v &&
                                            setForm({
                                                ...form,
                                                tipoImpuesto: v,
                                            })
                                        }
                                    >
                                        <SelectTrigger id="tipoImpuesto">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ISR">
                                                ISR
                                            </SelectItem>
                                            <SelectItem value="IGSS">
                                                IGSS
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.esGravable}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                esGravable: e.target.checked,
                                            })
                                        }
                                    />
                                    Es gravable
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.esBaseCalculo}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                esBaseCalculo: e.target.checked,
                                            })
                                        }
                                    />
                                    Forma parte de la base
                                </label>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={guardando}
                                    size="sm"
                                >
                                    {guardando ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        "Guardar regla"
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}

                    {cargando ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : reglas.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No hay reglas fiscales configuradas para este
                            concepto.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>País</TableHead>
                                    <TableHead>Año</TableHead>
                                    <TableHead>Impuesto</TableHead>
                                    <TableHead>Gravable</TableHead>
                                    <TableHead>Base</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reglas.map((r) => (
                                    <TableRow key={r.conceptoReglaFiscalId}>
                                        <TableCell className="font-mono text-xs">
                                            {r.pais}
                                        </TableCell>
                                        <TableCell>{r.anio}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {r.tipoImpuesto}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {r.esGravable ? (
                                                <Badge className="bg-red-100 text-red-800">
                                                    Sí
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    No
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {r.esBaseCalculo ? (
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    Sí
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    No
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleEliminar(
                                                        r.conceptoReglaFiscalId,
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
