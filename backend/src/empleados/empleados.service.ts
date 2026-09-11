import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Empleado } from './entities/empleado.entity';
import { Repository } from 'typeorm';
import { DepartamentosService } from '../departamentos/departamentos.service';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    private readonly departamentosService: DepartamentosService,
  ) {}


  async create(dto: CreateEmpleadoDto) {
    await this.departamentosService.findOne(dto.departamentoId);
    const empleado = this.empleadoRepository.create(dto);
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

    if(!empleado){
      throw new NotFoundException(`Empleado id ${id} no encontrado`);
    }

    return empleado;
  }

  async update(id: number, dto: UpdateEmpleadoDto) {
    const empleado: Empleado = await this.findOne(id);

    if (dto.departamentoId) {
      await this.departamentosService.findOne(dto.departamentoId);
    }

    Object.assign(empleado, dto);
    return this.empleadoRepository.save(empleado);
  }

  async remove(id: number) {
    const empleado: Empleado = await this.findOne(id);
    empleado.activo = false;
    return this.empleadoRepository.save(empleado);
  }
}
