import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodosModule } from '../periodos/periodos.module.js';
import { NominaDetalle } from './entities/nomina-detalle.entity.js';
import { NominaEmpleado } from './entities/nomina-empleado.entity.js';
import { NominaController } from './nomina.controller.js';
import { NominaService } from './nomina.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([NominaEmpleado, NominaDetalle]),
    PeriodosModule,
  ],
  controllers: [NominaController],
  providers: [NominaService],
  exports: [NominaService],
})
export class NominaModule {}
