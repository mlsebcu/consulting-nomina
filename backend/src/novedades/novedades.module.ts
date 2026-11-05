import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptosModule } from '../conceptos/conceptos.module';
import { EmpleadosModule } from '../empleados/empleados.module';
import { PeriodosModule } from '../periodos/periodos.module';
import { Novedad } from './entities/novedad.entity';
import { NovedadesController } from './novedades.controller';
import { NovedadesService } from './novedades.service';

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
