import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoDatoParametro } from '../common/enums/nomina.enums';
import { CopiarParametrosDto, UpdateParametroDto } from './dto/parametro.dto';
import { Parametro } from './entities/parametro.entity';

const NUMERO_PATTERN = /^-?\d+(\.\d+)?$/;

@Injectable()
export class ParametrosService {
  constructor(
    @InjectRepository(Parametro)
    private readonly parametroRepo: Repository<Parametro>,
  ) {}

  async aniosDisponibles(): Promise<number[]> {
    const filas = await this.parametroRepo
      .createQueryBuilder('p')
      .select('DISTINCT p.anio', 'anio')
      .where('p.activo = true')
      .orderBy('anio', 'DESC')
      .getRawMany<{ anio: number }>();
    return filas.map((f) => f.anio);
  }

  findByAnio(anio: number) {
    return this.parametroRepo.find({
      where: { anio, activo: true },
      order: { codigo: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateParametroDto, usuarioId: number) {
    const parametro = await this.parametroRepo.findOne({
      where: { parametroId: id, activo: true },
    });
    if (!parametro) {
      throw new NotFoundException(`Parámetro con id ${id} no encontrado`);
    }

    const valor = dto.valor.trim();
    if (
      parametro.tipoDato === TipoDatoParametro.NUMERO &&
      !NUMERO_PATTERN.test(valor)
    ) {
      throw new BadRequestException(
        `El parámetro ${parametro.codigo} requiere un valor numérico`,
      );
    }

    Object.assign(parametro, dto, {
      valor,
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });
    return this.parametroRepo.save(parametro);
  }

  async copiar(dto: CopiarParametrosDto, usuarioId: number) {
    if (dto.anioOrigen === dto.anioDestino) {
      throw new BadRequestException(
        'El año de destino debe ser distinto al de origen',
      );
    }

    const existentes = await this.parametroRepo.count({
      where: { anio: dto.anioDestino, activo: true },
    });
    if (existentes > 0) {
      throw new ConflictException(
        `El año ${dto.anioDestino} ya tiene parámetros configurados`,
      );
    }

    const origen = await this.findByAnio(dto.anioOrigen);
    if (origen.length === 0) {
      throw new NotFoundException(
        `No hay parámetros configurados para ${dto.anioOrigen}`,
      );
    }

    const copias = origen.map(({ codigo, descripcion, tipoDato, valor }) =>
      this.parametroRepo.create({
        codigo,
        descripcion,
        tipoDato,
        valor,
        anio: dto.anioDestino,
        creadoPor: usuarioId,
      }),
    );
    return this.parametroRepo.save(copias);
  }
}
