import type { NominaEmpleado } from "../Nomina.types";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye } from "lucide-react";
import { formatMoneda } from "@/utils/formatters";

interface Props {
    nominas: NominaEmpleado[];
    cargando: boolean;
    onVerDetalle: (nomina: NominaEmpleado) => void;
}

export function NominaLista({ nominas, cargando, onVerDetalle }: Props) {
    function colorTipo(tipo: NominaEmpleado["tipoNomina"]) {
        return tipo === "ANTICIPO"
            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
            : "bg-purple-100 text-purple-800 hover:bg-purple-100";
    }

    function colorEstado(estado: NominaEmpleado["estado"]) {
        return estado === "CERRADA"
            ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
            : "bg-green-100 text-green-800 hover:bg-green-100";
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nóminas del período</CardTitle>
                <CardDescription>
                    {nominas.length} nómina(s) calculada(s)
                </CardDescription>
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
                                <TableHead>Empleado</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">
                                    Percepciones
                                </TableHead>
                                <TableHead className="text-right">
                                    Deducciones
                                </TableHead>
                                <TableHead className="text-right">
                                    Provisiones
                                </TableHead>
                                <TableHead className="text-right">
                                    Anticipo
                                </TableHead>
                                <TableHead className="text-right">
                                    Líquido
                                </TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {nominas.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="text-center text-muted-foreground py-8"
                                    >
                                        No hay nóminas calculadas para este
                                        período
                                    </TableCell>
                                </TableRow>
                            ) : (
                                nominas.map((n) => (
                                    <TableRow key={n.nominaEmpleadoId}>
                                        <TableCell className="font-medium">
                                            {n.empleado
                                                ? `${n.empleado.nombres} ${n.empleado.apellidos}`
                                                : `#${n.empleadoId}`}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={colorTipo(
                                                    n.tipoNomina,
                                                )}
                                            >
                                                {n.tipoNomina}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs">
                                            {formatMoneda(n.totalPercepciones)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs">
                                            {formatMoneda(n.totalDeducciones)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs">
                                            {formatMoneda(n.totalProvisiones)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs">
                                            {formatMoneda(n.anticipo)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs font-semibold">
                                            {formatMoneda(n.liquido)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={colorEstado(
                                                    n.estado,
                                                )}
                                            >
                                                {n.estado}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onVerDetalle(n)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
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
