import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { NominaEmpleado } from "./entities/nomina-empleado.entity";
import { NominaDetalle } from "./entities/nomina-detalle.entity";
import { Periodo } from "../periodos/entities/periodo.entity";

@Injectable()
export class NominaService {
  constructor(
    @InjectRepository(NominaEmpleado)
    private readonly nominaRepo: Repository<NominaEmpleado>,
    @InjectRepository(NominaDetalle)
    private readonly detalleRepo: Repository<NominaDetalle>,
    @InjectRepository(Periodo)
    private readonly periodoRepo: Repository<Periodo>,
    private readonly dataSource: DataSource,
  ) {}

  // ============================================================
  // CALCULAR ANTICIPO
  // ============================================================
  async calcularAnticipo(periodoId: number) {
    const periodo = await this.obtenerPeriodo(periodoId);

    if (periodo.estado === "CERRADO") {
      throw new BadRequestException("El periodo ya está cerrado");
    }

    const yaExiste = await this.nominaRepo.count({
      where: { periodoId, tipoNomina: "ANTICIPO", activo: true },
    });
    if (yaExiste > 0) {
      throw new BadRequestException(
        "El anticipo ya fue calculado para este periodo",
      );
    }

    await this.dataSource.query(
      "EXEC dbo.sp_CalcularAnticipo @PeriodoId = @0",
      [periodoId],
    );

    return {
      mensaje: "Anticipo calculado correctamente",
      periodoId,
      totalNominas: await this.nominaRepo.count({
        where: { periodoId, tipoNomina: "ANTICIPO", activo: true },
      }),
    };
  }

  // ============================================================
  // CALCULAR NÓMINA FIN DE MES
  // ============================================================
  async calcularNomina(periodoId: number) {
    const periodo = await this.obtenerPeriodo(periodoId);

    if (periodo.estado === "CERRADO") {
      throw new BadRequestException("El periodo ya está cerrado");
    }

    const yaExiste = await this.nominaRepo.count({
      where: { periodoId, tipoNomina: "FINMES", activo: true },
    });
    if (yaExiste > 0) {
      throw new BadRequestException(
        "La nómina de fin de mes ya fue calculada para este periodo",
      );
    }

    await this.dataSource.query(
      "EXEC dbo.sp_CalcularNominaFinMes @PeriodoId = @0",
      [periodoId],
    );

    return {
      mensaje: "Nómina de fin de mes calculada correctamente",
      periodoId,
      totalNominas: await this.nominaRepo.count({
        where: { periodoId, tipoNomina: "FINMES", activo: true },
      }),
    };
  }

  // ============================================================
  // CERRAR NÓMINA
  // ============================================================
  async cerrarNomina(periodoId: number, usuarioId: number) {
    const periodo = await this.obtenerPeriodo(periodoId);

    if (periodo.estado === "CERRADO") {
      throw new BadRequestException("El periodo ya está cerrado");
    }

    const totalNominas = await this.nominaRepo.count({
      where: { periodoId, activo: true },
    });
    if (totalNominas === 0) {
      throw new BadRequestException(
        "No hay nóminas calculadas para este periodo",
      );
    }

    await this.dataSource.query(
      "EXEC dbo.sp_CerrarNomina @PeriodoId = @0, @UsuarioId = @1",
      [periodoId, usuarioId],
    );

    return {
      mensaje: "Nómina cerrada correctamente",
      periodoId,
      totalNominas,
    };
  }

  // ============================================================
  // CONSULTAS
  // ============================================================
  async listarPorPeriodo(periodoId: number) {
    await this.obtenerPeriodo(periodoId);

    return this.nominaRepo.find({
      where: { periodoId, activo: true },
      relations: { empleado: true, periodo: true },
      order: { nominaEmpleadoId: "ASC" },
    });
  }

  async obtenerUna(nominaEmpleadoId: number) {
    const nomina = await this.nominaRepo.findOne({
      where: { nominaEmpleadoId, activo: true },
      relations: {
        empleado: true,
        periodo: true,
        detalles: true,
      },
      order: { detalles: { orden: "ASC" } },
    });

    if (!nomina) {
      throw new NotFoundException(
        `Nómina con id ${nominaEmpleadoId} no encontrada`,
      );
    }

    return nomina;
  }

  // ============================================================
  // HELPERS
  // ============================================================
  private async obtenerPeriodo(periodoId: number) {
    const periodo = await this.periodoRepo.findOne({
      where: { periodoId, activo: true },
    });
    if (!periodo) {
      throw new NotFoundException(`Periodo con id ${periodoId} no encontrado`);
    }
    return periodo;
  }
}
