import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartamentosModule } from '../departamentos/departamentos.module';
import { EmpleadosController } from './empleados.controller';
import { EmpleadosService } from './empleados.service';
import { Empleado } from './entities/empleado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Empleado]), DepartamentosModule],
  controllers: [EmpleadosController],
  providers: [EmpleadosService],
  exports: [EmpleadosService],
})
export class EmpleadosModule {}
