import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { DepartamentosService } from '../departamentos/departamentos.service.js';
import { CreateEmpleadoDto } from './dto/create-empleado.dto.js';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto.js';
import { Empleado } from './entities/empleado.entity.js';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    private readonly departamentosService: DepartamentosService,
  ) {}

  async create(dto: CreateEmpleadoDto, usuarioId: number) {
    await this.departamentosService.findOne(dto.departamentoId);
    await this.validarIdentificadoresUnicos(dto);

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
      order: { apellidos: 'ASC', nombres: 'ASC' },
    });
  }

  async findOne(id: number) {
    const empleado = await this.empleadoRepository.findOne({
      where: { empleadoId: id, activo: true },
      relations: { departamento: true },
    });
    if (!empleado) {
      throw new NotFoundException(`Empleado con id ${id} no encontrado`);
    }
    return empleado;
  }

  async update(id: number, dto: UpdateEmpleadoDto, usuarioId: number) {
    const empleado = await this.findOne(id);

    if (dto.departamentoId && dto.departamentoId !== empleado.departamentoId) {
      await this.departamentosService.findOne(dto.departamentoId);
    }
    await this.validarIdentificadoresUnicos(dto, id);

    Object.assign(empleado, dto, {
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });
    return this.empleadoRepository.save(empleado);
  }

  async remove(id: number, usuarioId: number) {
    const empleado = await this.findOne(id);
    Object.assign(empleado, {
      activo: false,
      eliminadoPor: usuarioId,
      fechaEliminacion: new Date(),
    });
    return this.empleadoRepository.save(empleado);
  }

  private async validarIdentificadoresUnicos(
    dto: Pick<UpdateEmpleadoDto, 'codigoEmpleado' | 'dpi'>,
    excluirId?: number,
  ) {
    const excluir = excluirId ? { empleadoId: Not(excluirId) } : {};

    if (dto.codigoEmpleado) {
      const existe = await this.empleadoRepository.exists({
        where: { codigoEmpleado: dto.codigoEmpleado, activo: true, ...excluir },
      });
      if (existe) {
        throw new ConflictException(
          `Ya existe un empleado con código ${dto.codigoEmpleado}`,
        );
      }
    }

    if (dto.dpi) {
      const existe = await this.empleadoRepository.exists({
        where: { dpi: dto.dpi, activo: true, ...excluir },
      });
      if (existe) {
        throw new ConflictException(`Ya existe un empleado con DPI ${dto.dpi}`);
      }
    }
  }
}
