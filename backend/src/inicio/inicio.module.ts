import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departamento } from '../departamentos/entities/departamento.entity.js';
import { Empleado } from '../empleados/entities/empleado.entity.js';
import { NominaEmpleado } from '../nomina/entities/nomina-empleado.entity.js';
import { Novedad } from '../novedades/entities/novedad.entity.js';
import { PeriodosModule } from '../periodos/periodos.module.js';
import { ReportesModule } from '../reportes/reportes.module.js';
import { InicioController } from './inicio.controller.js';
import { InicioService } from './inicio.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empleado, Departamento, Novedad, NominaEmpleado]),
    PeriodosModule,
    ReportesModule,
  ],
  controllers: [InicioController],
  providers: [InicioService],
})
export class InicioModule {}
