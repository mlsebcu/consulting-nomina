import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptosModule } from '../conceptos/conceptos.module.js';
import { EmpleadosModule } from '../empleados/empleados.module.js';
import { PeriodosModule } from '../periodos/periodos.module.js';
import { Novedad } from './entities/novedad.entity.js';
import { NovedadesController } from './novedades.controller.js';
import { NovedadesService } from './novedades.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Novedad]),
    PeriodosModule,
    EmpleadosModule,
    ConceptosModule,
  ],
  controllers: [NovedadesController],
  providers: [NovedadesService],
})
export class NovedadesModule {}
