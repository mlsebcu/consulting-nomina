import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class ReportesService {
    constructor(private readonly dataSource: DataSource) {}

    // ============================================================
    // CUMPLEAÑEROS
    // ============================================================
    async listadoCumpleanieros(mes: number) {
        const lista = await this.dataSource.query(
            "EXEC dbo.sp_ListadoCumpleanieros @Mes = @0",
            [mes],
        );

        return {
            lista: Array.isArray(lista) ? lista : [],
        };
    }

    // ============================================================
    // IGSS
    // ============================================================
    async listadoIGSS(periodoId: number) {
        const filas = await this.dataSource.query<Array<{ MontoIGSS: number }>>(
            "EXEC dbo.sp_ListadoDescuentosIGSS @PeriodoId = @0",
            [periodoId],
        );

        const lista = Array.isArray(filas) ? filas : [];
        const totalIGSS = lista.reduce(
            (sum, r) => sum + Number(r.MontoIGSS ?? 0),
            0,
        );

        return {
            lista,
            total: { totalIGSS: Number(totalIGSS.toFixed(2)) },
        };
    }

    // ============================================================
    // ISR
    // ============================================================
    async listadoISR(periodoId: number) {
        const filas = await this.dataSource.query<Array<{ MontoISR: number }>>(
            "EXEC dbo.sp_ListadoDescuentosISR @PeriodoId = @0",
            [periodoId],
        );

        const lista = Array.isArray(filas) ? filas : [];
        const totalISR = lista.reduce(
            (sum, r) => sum + Number(r.MontoISR ?? 0),
            0,
        );

        return {
            lista,
            total: { totalISR: Number(totalISR.toFixed(2)) },
        };
    }

    // ============================================================
    // PÓLIZA CONTABLE
    // ============================================================
    async polizaContabilidad(periodoId: number) {
        const filas = await this.dataSource.query<
            Array<{ Debe: number; Haber: number }>
        >("EXEC dbo.sp_PolizaContabilidad @PeriodoId = @0", [periodoId]);

        const lista = Array.isArray(filas) ? filas : [];
        const totalDebe = lista.reduce(
            (sum, r) => sum + Number(r.Debe ?? 0),
            0,
        );
        const totalHaber = lista.reduce(
            (sum, r) => sum + Number(r.Haber ?? 0),
            0,
        );

        return {
            lista,
            totales: {
                debe: Number(totalDebe.toFixed(2)),
                haber: Number(totalHaber.toFixed(2)),
                cuadra: Math.abs(totalDebe - totalHaber) < 0.01,
            },
        };
    }

    // ============================================================
    // LIBRO DE SALARIOS
    // ============================================================
    async libroSalarios(periodoId: number) {
        const filas = await this.dataSource.query<
            Array<{
                Departamento: string;
                TotalPercepciones: number;
                TotalDeducciones: number;
                TotalProvisiones: number;
                Anticipo: number;
                Liquido: number;
            }>
        >("EXEC dbo.sp_LibroSalarios @PeriodoId = @0", [periodoId]);

        const lista = Array.isArray(filas) ? filas : [];

        // Agrupar por departamento
        const porDepartamento = new Map<
            string,
            {
                Departamento: string;
                TotalEmpleados: number;
                TotalIngresos: number;
                TotalEgresos: number;
                TotalProvisiones: number;
                TotalAnticipo: number;
                TotalLiquido: number;
            }
        >();

        for (const fila of lista) {
            const key = fila.Departamento;
            const actual = porDepartamento.get(key) ?? {
                Departamento: key,
                TotalEmpleados: 0,
                TotalIngresos: 0,
                TotalEgresos: 0,
                TotalProvisiones: 0,
                TotalAnticipo: 0,
                TotalLiquido: 0,
            };

            actual.TotalEmpleados += 1;
            actual.TotalIngresos += Number(fila.TotalPercepciones ?? 0);
            actual.TotalEgresos += Number(fila.TotalDeducciones ?? 0);
            actual.TotalProvisiones += Number(fila.TotalProvisiones ?? 0);
            actual.TotalAnticipo += Number(fila.Anticipo ?? 0);
            actual.TotalLiquido += Number(fila.Liquido ?? 0);

            porDepartamento.set(key, actual);
        }

        return {
            lista,
            totales: Array.from(porDepartamento.values()).map((t) => ({
                ...t,
                TotalIngresos: Number(t.TotalIngresos.toFixed(2)),
                TotalEgresos: Number(t.TotalEgresos.toFixed(2)),
                TotalProvisiones: Number(t.TotalProvisiones.toFixed(2)),
                TotalAnticipo: Number(t.TotalAnticipo.toFixed(2)),
                TotalLiquido: Number(t.TotalLiquido.toFixed(2)),
            })),
        };
    }

    // ============================================================
    // RECIBO DE NÓMINA (mantiene 2 result sets)
    // ============================================================
    async reciboNomina(nominaEmpleadoId: number) {
        const resultSets = await this.dataSource.query(
            "EXEC dbo.sp_ReciboNomina @NominaEmpleadoId = @0",
            [nominaEmpleadoId],
        );

        const cabecera = this.primerResultSet(resultSets);
        if (!cabecera) {
            throw new NotFoundException(
                `Nómina con id ${nominaEmpleadoId} no encontrada`,
            );
        }

        return {
            cabecera,
            detalle: this.segundoResultSet(resultSets),
        };
    }

    // ============================================================
    // HELPERS (solo para recibo)
    // ============================================================
    private primerResultSet(resultSets: unknown): unknown {
        if (!Array.isArray(resultSets) || resultSets.length === 0) return null;
        const first = resultSets[0];
        if (Array.isArray(first)) return first[0] ?? null;
        return first;
    }

    private segundoResultSet(resultSets: unknown): unknown[] {
        if (!Array.isArray(resultSets) || resultSets.length < 2) return [];
        const second = resultSets[1];
        if (Array.isArray(second)) return second;
        return [second];
    }
}
