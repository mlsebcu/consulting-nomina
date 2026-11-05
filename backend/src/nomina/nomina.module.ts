import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodosModule } from '../periodos/periodos.module';
import { NominaDetalle } from './entities/nomina-detalle.entity';
import { NominaEmpleado } from './entities/nomina-empleado.entity';
import { NominaController } from './nomina.controller';
import { NominaService } from './nomina.service';

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
