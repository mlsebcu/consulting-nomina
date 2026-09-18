import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class ReportesService {
    constructor(private readonly dataSource: DataSource) {}

    async listadoCumpleanieros(mes: number) {
        return this.dataSource.query(
            "EXEC dbo.sp_ListadoCumpleanieros @Mes = @0",
            [mes],
        );
    }

    async listadoIGSS(periodoId: number) {
        return this.dataSource.query(
            "EXEC dbo.sp_ListadoDescuentosIGSS @PeriodoId = @0",
            [periodoId],
        );
    }

    async listadoISR(periodoId: number) {
        return this.dataSource.query(
            "EXEC dbo.sp_ListadoDescuentosISR @PeriodoId = @0",
            [periodoId],
        );
    }

    async polizaContabilidad(periodoId: number) {
        return this.dataSource.query(
            "EXEC dbo.sp_PolizaContabilidad @PeriodoId = @0",
            [periodoId],
        );
    }

    async libroSalarios(periodoId: number) {
        return this.dataSource.query(
            "EXEC dbo.sp_LibroSalarios @PeriodoId = @0",
            [periodoId],
        );
    }

    async reciboNomina(nominaEmpleadoId: number) {
        return this.dataSource.query(
            "EXEC dbo.sp_ReciboNomina @NominaEmpleadoId = @0",
            [nominaEmpleadoId],
        );
    }
}
