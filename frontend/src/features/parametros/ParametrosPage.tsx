import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CopyIcon, InfoIcon, Loader2, SaveIcon } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { parametrosApi, type Parametro } from "./Parametros.api";

export default function ParametrosPage() {
    const { esAdmin } = useAuth();
    const [anios, setAnios] = useState<number[]>([]);
    const [anio, setAnio] = useState<number | null>(null);
    const [parametros, setParametros] = useState<Parametro[]>([]);
    const [editados, setEditados] = useState<Record<number, string>>({});
    const [guardandoId, setGuardandoId] = useState<number | null>(null);
    const [confirmarCopia, setConfirmarCopia] = useState(false);
    const [copiando, setCopiando] = useState(false);
    const [cargando, setCargando] = useState(true);

    const cargarAnios = useCallback(async (seleccionar?: number) => {
        try {
            const data = await parametrosApi.anios();
            setAnios(data);
            setAnio(seleccionar ?? data[0] ?? null);
        } catch (err) {
            toast.error(mensajeError(err, "No se pudieron cargar los años configurados."));
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        void cargarAnios();
    }, [cargarAnios]);

    useEffect(() => {
        if (!anio) return;
        setEditados({});
        parametrosApi
            .porAnio(anio)
            .then(setParametros)
            .catch((err) => toast.error(mensajeError(err, "No se pudieron cargar los parámetros.")));
    }, [anio]);

    const siguienteAnio = anios.length > 0 ? Math.max(...anios) + 1 : null;

    async function guardar(p: Parametro) {
        const valor = editados[p.parametroId];
        if (valor === undefined || valor === p.valor) return;
        setGuardandoId(p.parametroId);
        try {
            const actualizado = await parametrosApi.update(p.parametroId, valor);
            setParametros((lista) =>
                lista.map((x) => (x.parametroId === p.parametroId ? actualizado : x)),
            );
            setEditados((prev) => {
                const resto = { ...prev };
                delete resto[p.parametroId];
                return resto;
            });
            toast.success(`${p.codigo} actualizado`);
        } catch (err) {
            toast.error(mensajeError(err, "No se pudo guardar el parámetro."));
        } finally {
            setGuardandoId(null);
        }
    }

    async function copiarAnio() {
        if (!anio || !siguienteAnio) return;
        setCopiando(true);
        try {
            await parametrosApi.copiar(anio, siguienteAnio);
            toast.success(`Parámetros copiados a ${siguienteAnio}`);
            setConfirmarCopia(false);
            await cargarAnios(siguienteAnio);
        } catch (err) {
            toast.error(mensajeError(err, "No se pudieron copiar los parámetros."));
        } finally {
            setCopiando(false);
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1.5">
                    <CardTitle>Parámetros de nómina</CardTitle>
                    <CardDescription>
                        Valores legales y operativos que usa el cálculo. Los porcentajes se ingresan
                        como número (4.83 equivale a 4.83 %).
                    </CardDescription>
                </div>
                <div className="flex items-end gap-2">
                    <div className="grid gap-2">
                        <Label htmlFor="anio">Año</Label>
                        <Select
                            value={anio ? String(anio) : ""}
                            onValueChange={(v) => v && setAnio(Number(v))}
                            disabled={anios.length === 0}
                        >
                            <SelectTrigger id="anio" className="w-28">
                                <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent>
                                {anios.map((a) => (
                                    <SelectItem key={a} value={String(a)}>
                                        {a}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {esAdmin && siguienteAnio && (
                        <Button variant="outline" onClick={() => setConfirmarCopia(true)}>
                            <CopyIcon />
                            Preparar {siguienteAnio}
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <Alert>
                    <InfoIcon />
                    <AlertDescription>
                        Un cambio aplica a las nóminas que se calculen después de guardarlo. Para
                        actualizar una nómina abierta, vuelva a calcularla.
                    </AlertDescription>
                </Alert>

                {cargando ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="w-48">Valor</TableHead>
                                {esAdmin && <TableHead className="w-12" />}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parametros.map((p) => {
                                const valor = editados[p.parametroId] ?? p.valor;
                                const modificado = valor !== p.valor;
                                return (
                                    <TableRow key={p.parametroId}>
                                        <TableCell className="font-mono text-xs">{p.codigo}</TableCell>
                                        <TableCell className="whitespace-normal">{p.descripcion}</TableCell>
                                        <TableCell>
                                            {esAdmin ? (
                                                <Input
                                                    aria-label={p.descripcion}
                                                    value={valor}
                                                    inputMode={p.tipoDato === "NUMERO" ? "decimal" : "text"}
                                                    onChange={(e) =>
                                                        setEditados((prev) => ({
                                                            ...prev,
                                                            [p.parametroId]: e.target.value,
                                                        }))
                                                    }
                                                    onKeyDown={(e) => e.key === "Enter" && guardar(p)}
                                                    className="w-36 tabular-nums"
                                                />
                                            ) : (
                                                <span className="tabular-nums">{p.valor}</span>
                                            )}
                                        </TableCell>
                                        {esAdmin && (
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Guardar ${p.codigo}`}
                                                    disabled={!modificado || guardandoId === p.parametroId}
                                                    onClick={() => guardar(p)}
                                                >
                                                    {guardandoId === p.parametroId ? (
                                                        <Loader2 className="animate-spin" />
                                                    ) : (
                                                        <SaveIcon />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <ConfirmDialog
                open={confirmarCopia}
                titulo={`Preparar parámetros ${siguienteAnio ?? ""}`}
                descripcion={`Se copiarán los ${parametros.length} parámetros de ${anio} a ${siguienteAnio}. Luego podrá ajustar los valores que cambien por ley.`}
                textoConfirmar="Copiar parámetros"
                procesando={copiando}
                onConfirmar={copiarAnio}
                onCancelar={() => setConfirmarCopia(false)}
            />
        </Card>
    );
}
