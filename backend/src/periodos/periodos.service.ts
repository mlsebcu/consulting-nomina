import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Periodo } from "./entities/periodo.entity";
import { CreatePeriodoDto } from "./dto/create-periodo.dto";
import { UpdatePeriodoDto } from "./dto/update-periodo.dto";

@Injectable()
export class PeriodosService {
  constructor(
    @InjectRepository(Periodo)
    private readonly periodoRepo: Repository<Periodo>,
  ) {}

  async create(dto: CreatePeriodoDto, usuarioId: number) {
    this.validarFechas(dto.fechaInicio, dto.fechaFin);
    this.validarQuincena(dto.tipoPeriodo, dto.quincena);

    const existe = await this.periodoRepo.findOne({
      where: {
        anio: dto.anio,
        mes: dto.mes,
        tipoPeriodo: dto.tipoPeriodo,
        quincena: dto.quincena ?? IsNull(),
        activo: true,
      },
    });
    if (existe) {
      throw new ConflictException(
        `Ya existe un periodo ${dto.tipoPeriodo} para ${dto.anio}-${dto.mes}${
          dto.quincena ? ` quincena ${dto.quincena}` : ""
        }`,
      );
    }

    const periodo = this.periodoRepo.create({
      ...dto,
      estado: "ABIERTO",
      creadoPor: usuarioId,
    });

    return this.periodoRepo.save(periodo);
  }

  findAll() {
    return this.periodoRepo.find({
      where: { activo: true },
      order: { anio: "DESC", mes: "DESC", quincena: "DESC" },
    });
  }

  findAbiertos() {
    return this.periodoRepo.find({
      where: [
        { activo: true, estado: "ABIERTO" },
        { activo: true, estado: "EN_REVISION" },
      ],
      order: { anio: "DESC", mes: "DESC", quincena: "DESC" },
    });
  }

  async findOne(id: number) {
    const periodo = await this.periodoRepo.findOne({
      where: { periodoId: id, activo: true },
    });
    if (!periodo) {
      throw new NotFoundException(`Periodo con id ${id} no encontrado`);
    }
    return periodo;
  }

  async update(id: number, dto: UpdatePeriodoDto, usuarioId: number) {
    const periodo = await this.findOne(id);

    if (periodo.estado === "CERRADO") {
      throw new BadRequestException("No se puede modificar un periodo cerrado");
    }

    if (dto.fechaInicio || dto.fechaFin) {
      const inicio = dto.fechaInicio ?? periodo.fechaInicio;
      const fin = dto.fechaFin ?? periodo.fechaFin;
      this.validarFechas(inicio, fin);
    }

    if (dto.tipoPeriodo || dto.quincena !== undefined) {
      const tipo = dto.tipoPeriodo ?? periodo.tipoPeriodo;
      const quincena = dto.quincena ?? periodo.quincena ?? undefined;
      this.validarQuincena(tipo, quincena);
    }

    Object.assign(periodo, dto, {
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });

    return this.periodoRepo.save(periodo);
  }

  async remove(id: number, usuarioId: number) {
    const periodo = await this.findOne(id);

    if (periodo.estado === "CERRADO") {
      throw new BadRequestException("No se puede eliminar un periodo cerrado");
    }

    periodo.activo = false;
    periodo.eliminadoPor = usuarioId;
    periodo.fechaEliminacion = new Date();
    return this.periodoRepo.save(periodo);
  }

  async cerrar(id: number, usuarioId: number) {
    const periodo = await this.findOne(id);

    if (periodo.estado === "CERRADO") {
      throw new BadRequestException("El periodo ya está cerrado");
    }

    periodo.estado = "CERRADO";
    periodo.fechaCierre = new Date();
    periodo.cerradoPor = usuarioId;
    periodo.modificadoPor = usuarioId;
    periodo.fechaModificacion = new Date();

    return this.periodoRepo.save(periodo);
  }

  // ============================================================
  // VALIDACIONES
  // ============================================================

  private validarFechas(inicio: string, fin: string) {
    if (new Date(fin) <= new Date(inicio)) {
      throw new BadRequestException(
        "La fecha de fin debe ser mayor a la fecha de inicio",
      );
    }
  }

  private validarQuincena(tipo: string, quincena?: number) {
    if (tipo === "QUINCENAL" && quincena !== 1 && quincena !== 2) {
      throw new BadRequestException(
        "Para periodos quincenales, la quincena debe ser 1 o 2",
      );
    }
    if (tipo === "MENSUAL" && quincena !== undefined && quincena !== null) {
      throw new BadRequestException(
        "Para periodos mensuales, la quincena debe ser nula",
      );
    }
  }
}
