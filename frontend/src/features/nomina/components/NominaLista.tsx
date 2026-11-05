import { useState } from "react";
import { EyeIcon, Loader2 } from "lucide-react";
import { EstadoBadge } from "@/components/EstadoBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoneda } from "@/utils/formatters";
import type { NominaEmpleado, TipoNomina } from "../Nomina.types";

interface Props {
    nominas: NominaEmpleado[];
    cargando: boolean;
    onVerDetalle: (nomina: NominaEmpleado) => void;
}

type Columna = {
    titulo: string;
    valor: (n: NominaEmpleado) => number;
    destacada?: boolean;
};

const COLUMNAS: Record<TipoNomina, Columna[]> = {
    FINMES: [
        { titulo: "Ingresos", valor: (n) => n.totalPercepciones },
        { titulo: "Descuentos", valor: (n) => n.totalDeducciones },
        { titulo: "Anticipo", valor: (n) => n.anticipo },
        { titulo: "Líquido", valor: (n) => n.liquido, destacada: true },
        { titulo: "Provisiones", valor: (n) => n.totalProvisiones },
    ],
    ANTICIPO: [{ titulo: "Anticipo pagado", valor: (n) => n.liquido, destacada: true }],
};

export function NominaLista({ nominas, cargando, onVerDetalle }: Props) {
    const [tipo, setTipo] = useState<TipoNomina>("FINMES");
    const filas = nominas.filter((n) => n.tipoNomina === tipo);
    const columnas = COLUMNAS[tipo];
    const totalColumnas = columnas.length + 2;

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Resultado por empleado</CardTitle>
                <Tabs value={tipo} onValueChange={(v) => setTipo(v as TipoNomina)}>
                    <TabsList>
                        <TabsTrigger value="FINMES">Fin de mes</TabsTrigger>
                        <TabsTrigger value="ANTICIPO">Anticipo</TabsTrigger>
                    </TabsList>
                </Tabs>
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
                                <TableHead>Empleado</TableHead>
                                {columnas.map((c) => (
                                    <TableHead key={c.titulo} className="text-right">
                                        {c.titulo}
                                    </TableHead>
                                ))}
                                <TableHead className="w-28 text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filas.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={totalColumnas}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        {tipo === "FINMES"
                                            ? "La nómina de fin de mes aún no se ha calculado"
                                            : "El anticipo aún no se ha calculado"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filas.map((n) => (
                                    <TableRow key={n.nominaEmpleadoId}>
                                        <TableCell className="font-medium">
                                            {n.empleado
                                                ? `${n.empleado.nombres} ${n.empleado.apellidos}`
                                                : `#${n.empleadoId}`}
                                            <span className="block font-mono text-xs font-normal text-muted-foreground">
                                                {n.empleado?.codigoEmpleado}
                                            </span>
                                        </TableCell>
                                        {columnas.map((c) => (
                                            <TableCell
                                                key={c.titulo}
                                                className={`text-right tabular-nums ${c.destacada ? "font-semibold" : ""}`}
                                            >
                                                {formatMoneda(c.valor(n))}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <EstadoBadge estado={n.estado} />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Ver recibo"
                                                    onClick={() => onVerDetalle(n)}
                                                >
                                                    <EyeIcon />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        {filas.length > 0 && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell>Total ({filas.length})</TableCell>
                                    {columnas.map((c) => (
                                        <TableCell key={c.titulo} className="text-right tabular-nums">
                                            {formatMoneda(filas.reduce((s, n) => s + c.valor(n), 0))}
                                        </TableCell>
                                    ))}
                                    <TableCell />
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
