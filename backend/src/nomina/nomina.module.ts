import { Module } from '@nestjs/common';
import { NominaController } from './nomina.controller';
import { NominaService } from './nomina.service';
import { EgresoEmpleado } from './entities/egreso-empleado.entity';
import { Nomina } from './entities/nomina.entity';
import { IngresoEmpleado } from './entities/ingreso-empleado.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([IngresoEmpleado, EgresoEmpleado, Nomina])],
  controllers: [NominaController],
  providers: [NominaService]
})
export class NominaModule {}
