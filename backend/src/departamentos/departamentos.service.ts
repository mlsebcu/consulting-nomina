import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartamentoDto } from './dto/create-departamento.dto.js';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto.js';
import { Empleado } from '../empleados/entities/empleado.entity.js';
import { Departamento } from './entities/departamento.entity.js';

@Injectable()
export class DepartamentosService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) {}

  async create(dto: CreateDepartamentoDto, usuarioId: number) {
    await this.validarNombreUnico(dto.nombre);

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
      await this.validarNombreUnico(dto.nombre);
    }

    Object.assign(departamento, dto, {
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });
    return this.departamentoRepository.save(departamento);
  }

  async remove(id: number, usuarioId: number) {
    const departamento = await this.findOne(id);

    const empleadosActivos = await this.empleadoRepository.count({
      where: { departamentoId: id, activo: true },
    });
    if (empleadosActivos > 0) {
      throw new ConflictException(
        `No se puede eliminar: el departamento tiene ${empleadosActivos} empleado(s) activo(s)`,
      );
    }

    Object.assign(departamento, {
      activo: false,
      eliminadoPor: usuarioId,
      fechaEliminacion: new Date(),
    });
    return this.departamentoRepository.save(departamento);
  }

  private async validarNombreUnico(nombre: string) {
    const existe = await this.departamentoRepository.exists({
      where: { nombre, activo: true },
    });
    if (existe) {
      throw new ConflictException(
        `Ya existe un departamento con el nombre ${nombre}`,
      );
    }
  }
}
