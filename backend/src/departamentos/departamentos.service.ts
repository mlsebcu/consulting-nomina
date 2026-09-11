import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Departamento } from './entities/departamento.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DepartamentosService {

  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>
  ) {}

  create(dto: CreateDepartamentoDto) {
    const departmento = this.departamentoRepository.create(dto);
    return this.departamentoRepository.save(departmento);
  }

  findAll() {
    return this.departamentoRepository.find();
  }

  async findOne(id: number) {
    const departamento = await this.departamentoRepository.findOne({
      where: { departamentoId: id }
    });

    if(!departamento){
      throw new NotFoundException(`Departamento con id ${id} no encontrado`);
    }

    return departamento;
  }

  async update(id: number, dto: UpdateDepartamentoDto) {
    const departamento = await this.findOne(id);
    Object.assign(departamento, dto);
    return this.departamentoRepository.save(departamento);
  }

  async remove(id: number) {
    const departamento = await this.findOne(id);
    return this.departamentoRepository.remove(departamento);
  }
}
