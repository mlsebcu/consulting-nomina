import { Module } from '@nestjs/common';
import { NominaModule } from '../nomina/nomina.module';
import { PeriodosModule } from '../periodos/periodos.module';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  imports: [PeriodosModule, NominaModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
