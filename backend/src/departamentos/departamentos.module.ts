import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empleado } from '../empleados/entities/empleado.entity.js';
import { DepartamentosController } from './departamentos.controller.js';
import { DepartamentosService } from './departamentos.service.js';
import { Departamento } from './entities/departamento.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Departamento, Empleado])],
  controllers: [DepartamentosController],
  providers: [DepartamentosService],
  exports: [DepartamentosService],
})
export class DepartamentosModule {}
