import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CONCEPTOS_POR_HORAS } from '../common/constants/conceptos-sistema';
import { EstadoPeriodo, TipoCalculo } from '../common/enums/nomina.enums';
import { ConceptosService } from '../conceptos/conceptos.service';
import { Concepto } from '../conceptos/entities/concepto.entity';
import { EmpleadosService } from '../empleados/empleados.service';
import { PeriodosService } from '../periodos/periodos.service';
import { CreateNovedadDto } from './dto/create-novedad.dto';
import { UpdateNovedadDto } from './dto/update-novedad.dto';
import { Novedad } from './entities/novedad.entity';

export type ModoCaptura = 'CANTIDAD' | 'MONTO';

export function modoCaptura(
  concepto: Pick<Concepto, 'codigo' | 'tipoCalculo'>,
): ModoCaptura | null {
  if (CONCEPTOS_POR_HORAS.includes(concepto.codigo)) {
    return 'CANTIDAD';
  }
  return concepto.tipoCalculo === TipoCalculo.MANUAL ? 'MONTO' : null;
}

@Injectable()
export class NovedadesService {
  constructor(
    @InjectRepository(Novedad)
    private readonly novedadRepo: Repository<Novedad>,
    private readonly periodosService: PeriodosService,
    private readonly empleadosService: EmpleadosService,
    private readonly conceptosService: ConceptosService,
  ) {}

  async conceptosCapturables() {
    const conceptos = await this.conceptosService.findAllConceptos();
    return conceptos
      .map((concepto) => ({ ...concepto, modoCaptura: modoCaptura(concepto) }))
      .filter((concepto) => concepto.modoCaptura !== null);
  }

  findByPeriodo(periodoId: number) {
    return this.novedadRepo.find({
      where: { periodoId, activo: true },
      relations: { empleado: true, concepto: { naturaleza: true } },
      order: { empleado: { apellidos: 'ASC' }, concepto: { codigo: 'ASC' } },
    });
  }

  async create(dto: CreateNovedadDto, usuarioId: number) {
    await this.validarPeriodoAbierto(dto.periodoId);
    await this.empleadosService.findOne(dto.empleadoId);
    const valores = await this.validarValores(dto.conceptoId, dto);

    return this.novedadRepo.save(
      this.novedadRepo.create({ ...dto, ...valores, creadoPor: usuarioId }),
    );
  }

  async update(id: number, dto: UpdateNovedadDto, usuarioId: number) {
    const novedad = await this.findOne(id);
    await this.validarPeriodoAbierto(novedad.periodoId);

    const valores = await this.validarValores(
      dto.conceptoId ?? novedad.conceptoId,
      {
        cantidad: dto.cantidad ?? novedad.cantidad ?? undefined,
        monto: dto.monto ?? novedad.monto ?? undefined,
      },
    );

    Object.assign(novedad, dto, valores, {
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });
    return this.novedadRepo.save(novedad);
  }

  async remove(id: number, usuarioId: number) {
    const novedad = await this.findOne(id);
    await this.validarPeriodoAbierto(novedad.periodoId);

    Object.assign(novedad, {
      activo: false,
      eliminadoPor: usuarioId,
      fechaEliminacion: new Date(),
    });
    return this.novedadRepo.save(novedad);
  }

  private async findOne(id: number) {
    const novedad = await this.novedadRepo.findOne({
      where: { novedadId: id, activo: true },
    });
    if (!novedad) {
      throw new NotFoundException(`Novedad con id ${id} no encontrada`);
    }
    return novedad;
  }

  private async validarPeriodoAbierto(periodoId: number) {
    const periodo = await this.periodosService.findOne(periodoId);
    if (periodo.estado === EstadoPeriodo.CERRADO) {
      throw new BadRequestException(
        'No se pueden modificar novedades de un período cerrado',
      );
    }
  }

  private async validarValores(
    conceptoId: number,
    valores: { cantidad?: number; monto?: number },
  ): Promise<{ cantidad: number | null; monto: number | null }> {
    const concepto = await this.conceptosService.findOneConcepto(conceptoId);
    const modo = modoCaptura(concepto);

    if (modo === 'CANTIDAD') {
      if (!valores.cantidad) {
        throw new BadRequestException(
          `${concepto.nombre} requiere la cantidad de horas`,
        );
      }
      return { cantidad: valores.cantidad, monto: null };
    }

    if (modo === 'MONTO') {
      if (!valores.monto) {
        throw new BadRequestException(`${concepto.nombre} requiere un monto`);
      }
      return { cantidad: null, monto: valores.monto };
    }

    throw new BadRequestException(
      `${concepto.nombre} se calcula automáticamente y no admite novedades`,
    );
  }
}
