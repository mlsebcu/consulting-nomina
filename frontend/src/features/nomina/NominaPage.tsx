import { useCallback, useEffect, useState } from "react";
import type { NominaEmpleado } from "./Nomina.types";
import { nominaApi } from "./Nomina.api";
import { CalculoPanel } from "./components/CalculoPanel";
import { NominaLista } from "./components/NominaLista";
import { NominaDetalleDialog } from "./components/NominaDetalleDialog";

export default function NominaPage() {
    const [nominas, setNominas] = useState<NominaEmpleado[]>([]);
    const [cargando, setCargando] = useState(false);
    const [periodoId, setPeriodoId] = useState<number | null>(null);
    const [detalleId, setDetalleId] = useState<number | null>(null);

    const cargarNominas = useCallback(async (id: number) => {
        setCargando(true);
        try {
            setNominas(await nominaApi.listarPorPeriodo(id));
        } catch {
            setNominas([]);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        if (periodoId) {
            cargarNominas(periodoId);
        }
    }, [periodoId, cargarNominas]);

    function handleCalculo(id: number) {
        setPeriodoId(id);
        cargarNominas(id);
    }

    return (
        <div className="space-y-6">
            <CalculoPanel onCalculo={handleCalculo} />

            {periodoId && (
                <NominaLista
                    nominas={nominas}
                    cargando={cargando}
                    onVerDetalle={(n) => setDetalleId(n.nominaEmpleadoId)}
                />
            )}

            <NominaDetalleDialog
                nominaId={detalleId}
                open={!!detalleId}
                onOpenChange={(open) => !open && setDetalleId(null)}
            />
        </div>
    );
}
