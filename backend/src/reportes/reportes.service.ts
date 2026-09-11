import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportesService {
    constructor(private readonly dataSource: DataSource) { }

    async listadoCumpleanieros(mes: number) {
        return this.dataSource.query(
            `EXEC dbo.sp_ListadoCumpleanieros @Mes = @0`,
            [mes],
        );
    }

    async listadoDescuentosIGSS(periodo: string) {
        return this.dataSource.query(
            `EXEC dbo.sp_ListadoDescuentosIGSS @Periodo = @0`,
            [periodo],
        );
    }

    async listadoDescuentosISR(periodo: string) {
        return this.dataSource.query(
            `EXEC dbo.sp_ListadoDescuentosISR @Periodo = @0`,
            [periodo],
        );
    }

    async polizaContabilidad(periodo: string) {
        return this.dataSource.query(
            `EXEC dbo.sp_PolizaContabilidad @Periodo = @0`,
            [periodo],
        );
    }

    async libroSalarios(periodo: string) {
        return this.dataSource.query(
            `EXEC dbo.sp_LibroSalarios @Periodo = @0`,
            [periodo],
        );
    }
}
