import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateConceptoDto } from "./dto/create-concepto.dto";
import { UpdateConceptoDto } from "./dto/update-concepto.dto";
import { UpdateReglaFiscalDto } from "./dto/update-regla-fiscal.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NaturalezaConcepto } from "./entities/naturaleza-concepto.entity";
import { Concepto } from "./entities/concepto.entity";
import { ConceptoReglaFiscal } from "./entities/concepto-regla-fiscal.entity";
import { CreateNaturalezaDto } from "./dto/create-naturaleza.dto";
import { UpdateNaturalezaDto } from "./dto/update-naturaleza.dto";
import { CreateReglaFiscalDto } from "./dto/create-regla-fiscal.dto";

@Injectable()
export class ConceptosService {
  constructor(
    @InjectRepository(NaturalezaConcepto)
    private readonly naturalezaRepo: Repository<NaturalezaConcepto>,
    @InjectRepository(Concepto)
    private readonly conceptoRepo: Repository<Concepto>,
    @InjectRepository(ConceptoReglaFiscal)
    private readonly reglaFiscalRepo: Repository<ConceptoReglaFiscal>,
  ) {}

  // ============================================================
  // NATURALEZAS
  // ============================================================

  async createNaturaleza(dto: CreateNaturalezaDto, usuarioId: number) {
    const existe = await this.naturalezaRepo.findOne({
      where: { codigo: dto.codigo, activo: true },
    });
    if (existe) {
      throw new ConflictException(
        `Ya existe una naturaleza con código ${dto.codigo}`,
      );
    }

    const naturaleza = this.naturalezaRepo.create({
      ...dto,
      creadoPor: usuarioId,
    });
    return this.naturalezaRepo.save(naturaleza);
  }

  findAllNaturalezas() {
    return this.naturalezaRepo.find({
      where: { activo: true },
      order: { orden: "ASC" },
    });
  }

  async findOneNaturaleza(id: number) {
    const naturaleza = await this.naturalezaRepo.findOne({
      where: { naturalezaId: id, activo: true },
    });
    if (!naturaleza) {
      throw new NotFoundException(`Naturaleza con id ${id} no encontrada`);
    }
    return naturaleza;
  }

  async updateNaturaleza(
    id: number,
    dto: UpdateNaturalezaDto,
    usuarioId: number,
  ) {
    const naturaleza = await this.findOneNaturaleza(id);
    Object.assign(naturaleza, dto, {
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });
    return this.naturalezaRepo.save(naturaleza);
  }

  async removeNaturaleza(id: number, usuarioId: number) {
    const naturaleza = await this.findOneNaturaleza(id);

    const enUso = await this.conceptoRepo.count({
      where: { naturalezaId: id, activo: true },
    });
    if (enUso > 0) {
      throw new ConflictException(
        `No se puede eliminar la naturaleza porque está en uso por ${enUso} concepto(s)`,
      );
    }

    naturaleza.activo = false;
    naturaleza.eliminadoPor = usuarioId;
    naturaleza.fechaEliminacion = new Date();
    return this.naturalezaRepo.save(naturaleza);
  }

  // ============================================================
  // CONCEPTOS
  // ============================================================

  async createConcepto(dto: CreateConceptoDto, usuarioId: number) {
    await this.findOneNaturaleza(dto.naturalezaId);

    const existe = await this.conceptoRepo.findOne({
      where: { codigo: dto.codigo, activo: true },
    });
    if (existe) {
      throw new ConflictException(
        `Ya existe un concepto con código ${dto.codigo}`,
      );
    }

    const concepto = this.conceptoRepo.create({
      ...dto,
      creadoPor: usuarioId,
    });
    return this.conceptoRepo.save(concepto);
  }

  findAllConceptos() {
    return this.conceptoRepo.find({
      where: { activo: true },
      relations: { naturaleza: true },
      order: { orden: "ASC" },
    });
  }

  async findOneConcepto(id: number) {
    const concepto = await this.conceptoRepo.findOne({
      where: { conceptoId: id, activo: true },
      relations: { naturaleza: true },
    });
    if (!concepto) {
      throw new NotFoundException(`Concepto con id ${id} no encontrado`);
    }
    return concepto;
  }

  async updateConcepto(id: number, dto: UpdateConceptoDto, usuarioId: number) {
    const concepto = await this.findOneConcepto(id);

    if (dto.naturalezaId) {
      await this.findOneNaturaleza(dto.naturalezaId);
    }

    if (dto.codigo && dto.codigo !== concepto.codigo) {
      const existe = await this.conceptoRepo.findOne({
        where: { codigo: dto.codigo, activo: true },
      });
      if (existe) {
        throw new ConflictException(
          `Ya existe un concepto con código ${dto.codigo}`,
        );
      }
    }

    Object.assign(concepto, dto, {
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });
    return this.conceptoRepo.save(concepto);
  }

  async removeConcepto(id: number, usuarioId: number) {
    const concepto = await this.findOneConcepto(id);
    concepto.activo = false;
    concepto.eliminadoPor = usuarioId;
    concepto.fechaEliminacion = new Date();
    return this.conceptoRepo.save(concepto);
  }

  // ============================================================
  // REGLAS FISCALES
  // ============================================================

  async createReglaFiscal(
    conceptoId: number,
    dto: CreateReglaFiscalDto,
    usuarioId: number,
  ) {
    await this.findOneConcepto(conceptoId);

    const existe = await this.reglaFiscalRepo.findOne({
      where: {
        conceptoId,
        pais: dto.pais,
        anio: dto.anio,
        tipoImpuesto: dto.tipoImpuesto,
        activo: true,
      },
    });
    if (existe) {
      throw new ConflictException(
        `Ya existe una regla fiscal para el concepto ${conceptoId} en ${dto.pais}/${dto.anio}/${dto.tipoImpuesto}`,
      );
    }

    const regla = this.reglaFiscalRepo.create({
      ...dto,
      conceptoId,
      creadoPor: usuarioId,
    });
    return this.reglaFiscalRepo.save(regla);
  }

  findReglasFiscalesByConcepto(conceptoId: number) {
    return this.reglaFiscalRepo.find({
      where: { conceptoId, activo: true },
      order: { anio: "DESC", tipoImpuesto: "ASC" },
    });
  }

  async updateReglaFiscal(
    conceptoId: number,
    reglaId: number,
    dto: UpdateReglaFiscalDto,
    usuarioId: number,
  ) {
    const regla = await this.reglaFiscalRepo.findOne({
      where: { conceptoReglaFiscalId: reglaId, conceptoId, activo: true },
    });
    if (!regla) {
      throw new NotFoundException(
        `Regla fiscal con id ${reglaId} no encontrada`,
      );
    }

    Object.assign(regla, dto, {
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });
    return this.reglaFiscalRepo.save(regla);
  }

  async removeReglaFiscal(
    conceptoId: number,
    reglaId: number,
    usuarioId: number,
  ) {
    const regla = await this.reglaFiscalRepo.findOne({
      where: { conceptoReglaFiscalId: reglaId, conceptoId, activo: true },
    });
    if (!regla) {
      throw new NotFoundException(
        `Regla fiscal con id ${reglaId} no encontrada`,
      );
    }

    regla.activo = false;
    regla.eliminadoPor = usuarioId;
    regla.fechaEliminacion = new Date();
    return this.reglaFiscalRepo.save(regla);
  }
}
