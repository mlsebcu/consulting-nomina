import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NaturalezasTable } from "./components/NaturalezasTable";
import { ConceptosTable } from "./components/ConceptosTable";

export default function ConceptosPage() {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="conceptos" className="w-full">
                <TabsList>
                    <TabsTrigger value="conceptos">Conceptos</TabsTrigger>
                    <TabsTrigger value="naturalezas">Naturalezas</TabsTrigger>
                </TabsList>

                <TabsContent value="conceptos" className="mt-6">
                    <ConceptosTable />
                </TabsContent>

                <TabsContent value="naturalezas" className="mt-6">
                    <NaturalezasTable />
                </TabsContent>
            </Tabs>
        </div>
    );
}
