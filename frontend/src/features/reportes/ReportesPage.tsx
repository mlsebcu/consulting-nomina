import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReporteCumpleanieros } from "./components/ReporteCumpleanieros";
import { ReporteIGSS } from "./components/ReporteIGSS";
import { ReporteISR } from "./components/ReporteISR";
import { ReportePoliza } from "./components/ReportePoliza";
import { ReporteLibroSalarios } from "./components/ReporteLibroSalarios";

export default function ReportesPage() {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="cumpleanieros" className="w-full">
                <TabsList className="flex flex-wrap">
                    <TabsTrigger value="cumpleanieros">
                        Cumpleañeros
                    </TabsTrigger>
                    <TabsTrigger value="igss">IGSS</TabsTrigger>
                    <TabsTrigger value="isr">ISR</TabsTrigger>
                    <TabsTrigger value="poliza">Póliza Contable</TabsTrigger>
                    <TabsTrigger value="libro">Libro de Salarios</TabsTrigger>
                </TabsList>

                <TabsContent value="cumpleanieros" className="mt-6">
                    <ReporteCumpleanieros />
                </TabsContent>

                <TabsContent value="igss" className="mt-6">
                    <ReporteIGSS />
                </TabsContent>

                <TabsContent value="isr" className="mt-6">
                    <ReporteISR />
                </TabsContent>

                <TabsContent value="poliza" className="mt-6">
                    <ReportePoliza />
                </TabsContent>

                <TabsContent value="libro" className="mt-6">
                    <ReporteLibroSalarios />
                </TabsContent>
            </Tabs>
        </div>
    );
}
