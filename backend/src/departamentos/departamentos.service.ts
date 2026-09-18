import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from './entities/departamento.entity';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
  ) { }

  async create(dto: CreateDepartamentoDto, usuarioId: number) {
    const existe = await this.departamentoRepository.findOne({
      where: { nombre: dto.nombre, activo: true },
    });

    if (existe) {
      throw new ConflictException(
        `Ya existe un departamento con el nombre ${dto.nombre}`,
      );
    }

    const departamento = this.departamentoRepository.create({
      ...dto,
      creadoPor: usuarioId,
    });

    return this.departamentoRepository.save(departamento);
  }

  findAll() {
    return this.departamentoRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const departamento = await this.departamentoRepository.findOne({
      where: { departamentoId: id, activo: true },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con id ${id} no encontrado`);
    }

    return departamento;
  }

  async update(id: number, dto: UpdateDepartamentoDto, usuarioId: number) {
    const departamento = await this.findOne(id);

    if (dto.nombre && dto.nombre !== departamento.nombre) {
      const existe = await this.departamentoRepository.findOne({
        where: { nombre: dto.nombre, activo: true },
      });

      if (existe) {
        throw new ConflictException(
          `Ya existe un departamento con el nombre ${dto.nombre}`,
        );
      }
    }

    Object.assign(departamento, dto, {
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });

    return this.departamentoRepository.save(departamento);
  }

  async remove(id: number, usuarioId: number) {
    const departamento = await this.findOne(id);
    departamento.activo = false;
    departamento.eliminadoPor = usuarioId;
    departamento.fechaEliminacion = new Date();
    return this.departamentoRepository.save(departamento);
  }
}