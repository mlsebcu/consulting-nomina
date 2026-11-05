import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empleado } from '../empleados/entities/empleado.entity';
import { DepartamentosController } from './departamentos.controller';
import { DepartamentosService } from './departamentos.service';
import { Departamento } from './entities/departamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Departamento, Empleado])],
  controllers: [DepartamentosController],
  providers: [DepartamentosService],
  exports: [DepartamentosService],
})
export class DepartamentosModule {}
