import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TipoNomina } from '../common/enums/nomina.enums.js';
import { Departamento } from '../departamentos/entities/departamento.entity.js';
import { Empleado } from '../empleados/entities/empleado.entity.js';
import { NominaEmpleado } from '../nomina/entities/nomina-empleado.entity.js';
import { Novedad } from '../novedades/entities/novedad.entity.js';
import { PeriodosService } from '../periodos/periodos.service.js';
import { ReportesService } from '../reportes/reportes.service.js';

export interface UltimaNomina {
  periodoId: number;
  anio: number;
  mes: number;
  empleados: number;
  totalIngresos: number;
  totalDescuentos: number;
  totalLiquido: number;
}

@Injectable()
export class InicioService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepo: Repository<Empleado>,
    @InjectRepository(Departamento)
    private readonly departamentoRepo: Repository<Departamento>,
    @InjectRepository(Novedad)
    private readonly novedadRepo: Repository<Novedad>,
    @InjectRepository(NominaEmpleado)
    private readonly nominaRepo: Repository<NominaEmpleado>,
    private readonly periodosService: PeriodosService,
    private readonly reportesService: ReportesService,
    private readonly dataSource: DataSource,
  ) {}

  async resumen() {
    const mesActual = new Date().getMonth() + 1;

    const [
      empleadosActivos,
      departamentos,
      [periodo],
      ultimaNomina,
      cumpleanieros,
    ] = await Promise.all([
      this.empleadoRepo.count({ where: { activo: true } }),
      this.departamentoRepo.count({ where: { activo: true } }),
      this.periodosService.findAbiertos(),
      this.ultimaNominaCalculada(),
      this.reportesService.listadoCumpleanieros(mesActual),
    ]);

    return {
      empleadosActivos,
      departamentos,
      periodo: periodo ?? null,
      proceso: periodo ? await this.estadoProceso(periodo.periodoId) : null,
      ultimaNomina,
      cumpleanieros: cumpleanieros.lista,
    };
  }

  private async estadoProceso(periodoId: number) {
    const [novedades, anticipos, finMes] = await Promise.all([
      this.novedadRepo.count({ where: { periodoId, activo: true } }),
      this.nominaRepo.count({
        where: { periodoId, tipoNomina: TipoNomina.ANTICIPO, activo: true },
      }),
      this.nominaRepo.count({
        where: { periodoId, tipoNomina: TipoNomina.FINMES, activo: true },
      }),
    ]);
    return { novedades, anticipos, finMes };
  }

  private async ultimaNominaCalculada(): Promise<UltimaNomina | null> {
    const [fila] = await this.dataSource.query<UltimaNomina[]>(
      `SELECT p.periodo_id          AS "periodoId",
              p.anio,
              p.mes,
              COUNT(*)              AS empleados,
              SUM(ne.total_percepciones) AS "totalIngresos",
              SUM(ne.total_deducciones)  AS "totalDescuentos",
              SUM(ne.liquido)            AS "totalLiquido"
       FROM nomina_empleado ne
       JOIN periodo p ON p.periodo_id = ne.periodo_id
       WHERE ne.tipo_nomina = $1 AND ne.activo AND p.activo
       GROUP BY p.periodo_id, p.anio, p.mes
       ORDER BY p.anio DESC, p.mes DESC
       LIMIT 1`,
      [TipoNomina.FINMES],
    );
    return fila ?? null;
  }
}
