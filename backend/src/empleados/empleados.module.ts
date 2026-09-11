import { Module } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { EmpleadosController } from './empleados.controller';
import { Empleado } from './entities/empleado.entity';
import { DepartamentosModule } from '../departamentos/departamentos.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Empleado]),
  DepartamentosModule,   // Es para que pueda inyectarse el servicio de Departamentos en el servicio de Empleados
],
  controllers: [EmpleadosController],
  providers: [EmpleadosService],
  exports: [EmpleadosService],  // Es para que nómina pueda inyectarlo
})
export class EmpleadosModule {}
