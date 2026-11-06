import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartamentosModule } from '../departamentos/departamentos.module.js';
import { EmpleadosController } from './empleados.controller.js';
import { EmpleadosService } from './empleados.service.js';
import { Empleado } from './entities/empleado.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Empleado]), DepartamentosModule],
  controllers: [EmpleadosController],
  providers: [EmpleadosService],
  exports: [EmpleadosService],
})
export class EmpleadosModule {}
