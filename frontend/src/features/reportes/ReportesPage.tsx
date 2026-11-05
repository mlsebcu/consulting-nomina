import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReporteCumpleanieros } from "./components/ReporteCumpleanieros";
import { ReporteIGSS } from "./components/ReporteIGSS";
import { ReporteISR } from "./components/ReporteISR";
import { ReporteLibroSalarios } from "./components/ReporteLibroSalarios";
import { ReportePoliza } from "./components/ReportePoliza";

const REPORTES = [
    { valor: "libro", titulo: "Libro de salarios", componente: ReporteLibroSalarios },
    { valor: "poliza", titulo: "Póliza contable", componente: ReportePoliza },
    { valor: "igss", titulo: "IGSS", componente: ReporteIGSS },
    { valor: "isr", titulo: "ISR", componente: ReporteISR },
    { valor: "cumpleanieros", titulo: "Cumpleañeros", componente: ReporteCumpleanieros },
] as const;

export default function ReportesPage() {
    return (
        <Tabs defaultValue={REPORTES[0].valor} className="w-full">
            <TabsList className="flex flex-wrap print:hidden">
                {REPORTES.map((r) => (
                    <TabsTrigger key={r.valor} value={r.valor}>
                        {r.titulo}
                    </TabsTrigger>
                ))}
            </TabsList>
            {REPORTES.map(({ valor, componente: Reporte }) => (
                <TabsContent key={valor} value={valor} className="mt-4">
                    <Reporte />
                </TabsContent>
            ))}
        </Tabs>
    );
}
