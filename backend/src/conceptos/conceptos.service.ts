import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { CreateNaturalezaDto } from './dto/create-naturaleza.dto';
import { CreateReglaFiscalDto } from './dto/create-regla-fiscal.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';
import { UpdateNaturalezaDto } from './dto/update-naturaleza.dto';
import { UpdateReglaFiscalDto } from './dto/update-regla-fiscal.dto';
import { ConceptoReglaFiscal } from './entities/concepto-regla-fiscal.entity';
import { Concepto } from './entities/concepto.entity';
import { NaturalezaConcepto } from './entities/naturaleza-concepto.entity';

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

  async createNaturaleza(dto: CreateNaturalezaDto, usuarioId: number) {
    const existe = await this.naturalezaRepo.exists({
      where: { codigo: dto.codigo, activo: true },
    });
    if (existe) {
      throw new ConflictException(
        `Ya existe una naturaleza con código ${dto.codigo}`,
      );
    }

    return this.naturalezaRepo.save(
      this.naturalezaRepo.create({ ...dto, creadoPor: usuarioId }),
    );
  }

  findAllNaturalezas() {
    return this.naturalezaRepo.find({
      where: { activo: true },
      order: { orden: 'ASC' },
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
    const enUso = await this.conceptosQueUsanNaturaleza(id);

    if (enUso > 0 && dto.codigo && dto.codigo !== naturaleza.codigo) {
      throw new ConflictException(
        'No se puede cambiar el código de una naturaleza asignada a conceptos',
      );
    }

    Object.assign(naturaleza, dto, {
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });
    return this.naturalezaRepo.save(naturaleza);
  }

  async removeNaturaleza(id: number, usuarioId: number) {
    const naturaleza = await this.findOneNaturaleza(id);
    const enUso = await this.conceptosQueUsanNaturaleza(id);

    if (enUso > 0) {
      throw new ConflictException(
        `No se puede eliminar la naturaleza porque está en uso por ${enUso} concepto(s)`,
      );
    }

    Object.assign(naturaleza, {
      activo: false,
      eliminadoPor: usuarioId,
      fechaEliminacion: new Date(),
    });
    return this.naturalezaRepo.save(naturaleza);
  }

  async createConcepto(dto: CreateConceptoDto, usuarioId: number) {
    await this.findOneNaturaleza(dto.naturalezaId);
    await this.validarCodigoConceptoUnico(dto.codigo);

    return this.conceptoRepo.save(
      this.conceptoRepo.create({
        ...dto,
        esSistema: false,
        creadoPor: usuarioId,
      }),
    );
  }

  findAllConceptos() {
    return this.conceptoRepo.find({
      where: { activo: true },
      relations: { naturaleza: true },
      order: { naturalezaId: 'ASC', orden: 'ASC' },
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

    if (concepto.esSistema) {
      const cambiaCodigo =
        dto.codigo !== undefined && dto.codigo !== concepto.codigo;
      const cambiaNaturaleza =
        dto.naturalezaId !== undefined &&
        dto.naturalezaId !== concepto.naturalezaId;
      const cambiaCalculo =
        dto.tipoCalculo !== undefined &&
        dto.tipoCalculo !== concepto.tipoCalculo;

      if (cambiaCodigo || cambiaNaturaleza || cambiaCalculo) {
        throw new BadRequestException(
          'En conceptos de sistema solo se puede modificar nombre, cuenta contable y orden',
        );
      }
    }

    if (dto.naturalezaId) {
      await this.findOneNaturaleza(dto.naturalezaId);
    }
    if (dto.codigo && dto.codigo !== concepto.codigo) {
      await this.validarCodigoConceptoUnico(dto.codigo);
    }

    Object.assign(concepto, dto, {
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });
    return this.conceptoRepo.save(concepto);
  }

  async removeConcepto(id: number, usuarioId: number) {
    const concepto = await this.findOneConcepto(id);

    if (concepto.esSistema) {
      throw new BadRequestException(
        'Los conceptos de sistema son requeridos por el cálculo de nómina y no pueden eliminarse',
      );
    }

    Object.assign(concepto, {
      activo: false,
      eliminadoPor: usuarioId,
      fechaEliminacion: new Date(),
    });
    return this.conceptoRepo.save(concepto);
  }

  async createReglaFiscal(
    conceptoId: number,
    dto: CreateReglaFiscalDto,
    usuarioId: number,
  ) {
    await this.findOneConcepto(conceptoId);

    const existe = await this.reglaFiscalRepo.exists({
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
        `Ya existe una regla ${dto.tipoImpuesto} para ${dto.pais} en ${dto.anio}`,
      );
    }

    return this.reglaFiscalRepo.save(
      this.reglaFiscalRepo.create({ ...dto, conceptoId, creadoPor: usuarioId }),
    );
  }

  findReglasFiscalesByConcepto(conceptoId: number) {
    return this.reglaFiscalRepo.find({
      where: { conceptoId, activo: true },
      order: { anio: 'DESC', tipoImpuesto: 'ASC' },
    });
  }

  async updateReglaFiscal(
    conceptoId: number,
    reglaId: number,
    dto: UpdateReglaFiscalDto,
    usuarioId: number,
  ) {
    const regla = await this.findOneReglaFiscal(conceptoId, reglaId);
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
    const regla = await this.findOneReglaFiscal(conceptoId, reglaId);
    Object.assign(regla, {
      activo: false,
      eliminadoPor: usuarioId,
      fechaEliminacion: new Date(),
    });
    return this.reglaFiscalRepo.save(regla);
  }

  private async findOneReglaFiscal(conceptoId: number, reglaId: number) {
    const regla = await this.reglaFiscalRepo.findOne({
      where: { conceptoReglaFiscalId: reglaId, conceptoId, activo: true },
    });
    if (!regla) {
      throw new NotFoundException(
        `Regla fiscal con id ${reglaId} no encontrada`,
      );
    }
    return regla;
  }

  private conceptosQueUsanNaturaleza(naturalezaId: number) {
    return this.conceptoRepo.count({ where: { naturalezaId, activo: true } });
  }

  private async validarCodigoConceptoUnico(codigo: string) {
    const existe = await this.conceptoRepo.exists({
      where: { codigo, activo: true },
    });
    if (existe) {
      throw new ConflictException(`Ya existe un concepto con código ${codigo}`);
    }
  }
}
