import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departamento } from '../departamentos/entities/departamento.entity';
import { Empleado } from '../empleados/entities/empleado.entity';
import { NominaEmpleado } from '../nomina/entities/nomina-empleado.entity';
import { Novedad } from '../novedades/entities/novedad.entity';
import { PeriodosModule } from '../periodos/periodos.module';
import { ReportesModule } from '../reportes/reportes.module';
import { InicioController } from './inicio.controller';
import { InicioService } from './inicio.service';

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
