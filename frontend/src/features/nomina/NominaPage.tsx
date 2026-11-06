import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { mensajeError } from "@/utils/errores";
import type { Periodo } from "../periodos/Periodos.types";
import { CalculoPanel } from "./components/CalculoPanel";
import { NominaDetalleDialog } from "./components/NominaDetalleDialog";
import { NominaLista } from "./components/NominaLista";
import { nominaApi } from "./Nomina.api";
import type { NominaEmpleado } from "./Nomina.types";

export default function NominaPage() {
    const [periodo, setPeriodo] = useState<Periodo | null>(null);
    const [nominas, setNominas] = useState<NominaEmpleado[]>([]);
    const [cargando, setCargando] = useState(false);
    const [detalleId, setDetalleId] = useState<number | null>(null);

    const cargarNominas = useCallback(async (periodoId: number) => {
        setCargando(true);
        try {
            setNominas(await nominaApi.listarPorPeriodo(periodoId));
        } catch (err) {
            setNominas([]);
            toast.error(mensajeError(err, "No se pudieron cargar las nóminas."));
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        if (periodo) void cargarNominas(periodo.periodoId);
    }, [periodo, cargarNominas]);

    const resumen = useMemo(
        () => ({
            anticipos: nominas.filter((n) => n.tipoNomina === "ANTICIPO").length,
            finMes: nominas.filter((n) => n.tipoNomina === "FINMES").length,
        }),
        [nominas],
    );

    return (
        <div className="space-y-4">
            <CalculoPanel
                periodo={periodo}
                resumen={resumen}
                onPeriodoChange={setPeriodo}
                onProcesado={() => periodo && cargarNominas(periodo.periodoId)}
            />

            {periodo && (
                <NominaLista
                    nominas={nominas}
                    cargando={cargando}
                    onVerDetalle={(n) => setDetalleId(n.nominaEmpleadoId)}
                />
            )}

            <NominaDetalleDialog
                nominaId={detalleId}
                onOpenChange={(open) => !open && setDetalleId(null)}
            />
        </div>
    );
}
