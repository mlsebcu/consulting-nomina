import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TipoNomina } from '../common/enums/nomina.enums.js';
import { PeriodosService } from '../periodos/periodos.service.js';
import { NominaEmpleado } from './entities/nomina-empleado.entity.js';

export interface ResultadoProceso {
  mensaje: string;
  periodoId: number;
  totalNominas: number;
}

type FuncionNomina =
  'fn_calcular_anticipo' | 'fn_calcular_nomina_fin_mes' | 'fn_cerrar_nomina';

@Injectable()
export class NominaService {
  constructor(
    @InjectRepository(NominaEmpleado)
    private readonly nominaRepo: Repository<NominaEmpleado>,
    private readonly periodosService: PeriodosService,
    private readonly dataSource: DataSource,
  ) {}

  async calcularAnticipo(
    periodoId: number,
    usuarioId: number,
  ): Promise<ResultadoProceso> {
    const totalNominas = await this.ejecutar(
      'fn_calcular_anticipo',
      periodoId,
      usuarioId,
    );
    return {
      mensaje: 'Anticipo calculado correctamente',
      periodoId,
      totalNominas,
    };
  }

  async calcularNomina(
    periodoId: number,
    usuarioId: number,
  ): Promise<ResultadoProceso> {
    const totalNominas = await this.ejecutar(
      'fn_calcular_nomina_fin_mes',
      periodoId,
      usuarioId,
    );
    return {
      mensaje: 'Nómina de fin de mes calculada correctamente',
      periodoId,
      totalNominas,
    };
  }

  async cerrarNomina(
    periodoId: number,
    usuarioId: number,
  ): Promise<ResultadoProceso> {
    const totalNominas = await this.ejecutar(
      'fn_cerrar_nomina',
      periodoId,
      usuarioId,
    );
    return { mensaje: 'Nómina cerrada correctamente', periodoId, totalNominas };
  }

  async listarPorPeriodo(periodoId: number, tipoNomina?: TipoNomina) {
    await this.periodosService.findOne(periodoId);

    return this.nominaRepo.find({
      where: { periodoId, activo: true, ...(tipoNomina && { tipoNomina }) },
      relations: { empleado: true, periodo: true },
      order: { tipoNomina: 'ASC', empleado: { apellidos: 'ASC' } },
    });
  }

  async obtenerUna(nominaEmpleadoId: number) {
    const nomina = await this.nominaRepo.findOne({
      where: { nominaEmpleadoId, activo: true },
      relations: {
        empleado: { departamento: true },
        periodo: true,
        detalles: true,
      },
      order: { detalles: { naturalezaCodigo: 'DESC', orden: 'ASC' } },
    });
    if (!nomina) {
      throw new NotFoundException(
        `Nómina con id ${nominaEmpleadoId} no encontrada`,
      );
    }
    return nomina;
  }

  private async ejecutar(
    funcion: FuncionNomina,
    periodoId: number,
    usuarioId: number,
  ) {
    await this.periodosService.findOne(periodoId);
    const [fila] = await this.dataSource.query<{ total: number }[]>(
      `SELECT ${funcion}($1, $2) AS total`,
      [periodoId, usuarioId],
    );
    return fila.total;
  }
}
