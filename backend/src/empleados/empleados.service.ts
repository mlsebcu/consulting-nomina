import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { DepartamentosService } from '../departamentos/departamentos.service';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    private readonly departamentosService: DepartamentosService,
  ) {}

  async create(dto: CreateEmpleadoDto, usuarioId: number) {
    await this.departamentosService.findOne(dto.departamentoId);

    const empleado = this.empleadoRepository.create({
      ...dto,
      creadoPor: usuarioId,
    });

    return this.empleadoRepository.save(empleado);
  }

  findAll() {
    return this.empleadoRepository.find({
      where: { activo: true },
      relations: { departamento: true },
    });
  }

  async findOne(id: number) {
    const empleado = await this.empleadoRepository.findOne({
      where: { empleadoId: id },
      relations: { departamento: true },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado id ${id} no encontrado`);
    }

    return empleado;
  }

  async update(id: number, dto: UpdateEmpleadoDto, usuarioId: number) {
    const empleado = await this.findOne(id);

    if (dto.departamentoId) {
      await this.departamentosService.findOne(dto.departamentoId);
    }

    Object.assign(empleado, dto, {
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });

    return this.empleadoRepository.save(empleado);
  }

  async remove(id: number, usuarioId: number) {
    const empleado = await this.findOne(id);
    empleado.activo = false;
    empleado.eliminadoPor = usuarioId;
    empleado.fechaEliminacion = new Date();
    return this.empleadoRepository.save(empleado);
  }
}