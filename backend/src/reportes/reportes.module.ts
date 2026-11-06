import { Module } from '@nestjs/common';
import { NominaModule } from '../nomina/nomina.module.js';
import { PeriodosModule } from '../periodos/periodos.module.js';
import { ReportesController } from './reportes.controller.js';
import { ReportesService } from './reportes.service.js';

@Module({
  imports: [PeriodosModule, NominaModule],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
