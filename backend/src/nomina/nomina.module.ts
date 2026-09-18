import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NominaService } from "./nomina.service";
import { NominaController } from "./nomina.controller";
import { NominaEmpleado } from "./entities/nomina-empleado.entity";
import { NominaDetalle } from "./entities/nomina-detalle.entity";
import { Periodo } from "../periodos/entities/periodo.entity";

@Module({
  imports: [TypeOrmModule.forFeature([NominaEmpleado, NominaDetalle, Periodo])],
  controllers: [NominaController],
  providers: [NominaService],
  exports: [NominaService],
})
export class NominaModule {}
