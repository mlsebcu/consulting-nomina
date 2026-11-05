import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { EstadoPeriodo, TipoPeriodo } from '../common/enums/nomina.enums';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';
import { Periodo } from './entities/periodo.entity';

const ORDEN_RECIENTES = {
  anio: 'DESC',
  mes: 'DESC',
  quincena: 'DESC',
} as const;

@Injectable()
export class PeriodosService {
  constructor(
    @InjectRepository(Periodo)
    private readonly periodoRepo: Repository<Periodo>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePeriodoDto, usuarioId: number) {
    this.validarFechas(dto.fechaInicio, dto.fechaFin);
    this.validarQuincena(dto.tipoPeriodo, dto.quincena ?? null);

    const existe = await this.periodoRepo.exists({
      where: {
        anio: dto.anio,
        mes: dto.mes,
        tipoPeriodo: dto.tipoPeriodo,
        quincena: dto.quincena ?? IsNull(),
        activo: true,
      },
    });
    if (existe) {
      const quincena = dto.quincena ? ` quincena ${dto.quincena}` : '';
      throw new ConflictException(
        `Ya existe un período ${dto.tipoPeriodo} para ${dto.mes}/${dto.anio}${quincena}`,
      );
    }

    return this.periodoRepo.save(
      this.periodoRepo.create({
        ...dto,
        estado: EstadoPeriodo.ABIERTO,
        creadoPor: usuarioId,
      }),
    );
  }

  findAll() {
    return this.periodoRepo.find({
      where: { activo: true },
      order: ORDEN_RECIENTES,
    });
  }

  findAbiertos() {
    return this.periodoRepo.find({
      where: {
        activo: true,
        estado: In([EstadoPeriodo.ABIERTO, EstadoPeriodo.EN_REVISION]),
      },
      order: ORDEN_RECIENTES,
    });
  }

  async findOne(id: number) {
    const periodo = await this.periodoRepo.findOne({
      where: { periodoId: id, activo: true },
    });
    if (!periodo) {
      throw new NotFoundException(`Período con id ${id} no encontrado`);
    }
    return periodo;
  }

  async update(id: number, dto: UpdatePeriodoDto, usuarioId: number) {
    const periodo = await this.findAbierto(id, 'modificar');

    this.validarFechas(
      dto.fechaInicio ?? periodo.fechaInicio,
      dto.fechaFin ?? periodo.fechaFin,
    );

    const tipo = dto.tipoPeriodo ?? periodo.tipoPeriodo;
    const quincena =
      tipo === TipoPeriodo.MENSUAL ? null : (dto.quincena ?? periodo.quincena);
    this.validarQuincena(tipo, quincena);

    Object.assign(periodo, dto, {
      quincena,
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });
    return this.periodoRepo.save(periodo);
  }

  async remove(id: number, usuarioId: number) {
    const periodo = await this.findAbierto(id, 'eliminar');
    Object.assign(periodo, {
      activo: false,
      eliminadoPor: usuarioId,
      fechaEliminacion: new Date(),
    });
    return this.periodoRepo.save(periodo);
  }

  async cerrar(id: number, usuarioId: number) {
    await this.findAbierto(id, 'cerrar');
    await this.dataSource.query('SELECT fn_cerrar_nomina($1, $2)', [
      id,
      usuarioId,
    ]);
    return this.findOne(id);
  }

  private async findAbierto(id: number, accion: string) {
    const periodo = await this.findOne(id);
    if (periodo.estado === EstadoPeriodo.CERRADO) {
      throw new BadRequestException(`No se puede ${accion} un período cerrado`);
    }
    return periodo;
  }

  private validarFechas(inicio: string, fin: string) {
    if (new Date(fin) <= new Date(inicio)) {
      throw new BadRequestException(
        'La fecha de fin debe ser mayor a la fecha de inicio',
      );
    }
  }

  private validarQuincena(tipo: TipoPeriodo, quincena: number | null) {
    if (tipo === TipoPeriodo.QUINCENAL && quincena === null) {
      throw new BadRequestException(
        'Los períodos quincenales requieren quincena 1 o 2',
      );
    }
    if (tipo === TipoPeriodo.MENSUAL && quincena !== null) {
      throw new BadRequestException(
        'Los períodos mensuales no llevan quincena',
      );
    }
  }
}
