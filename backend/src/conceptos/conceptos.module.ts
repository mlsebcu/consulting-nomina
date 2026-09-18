import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConceptosService } from "./conceptos.service";
import { ConceptosController } from "./conceptos.controller";
import { NaturalezaConcepto } from "./entities/naturaleza-concepto.entity";
import { Concepto } from "./entities/concepto.entity";
import { ConceptoReglaFiscal } from "./entities/concepto-regla-fiscal.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NaturalezaConcepto,
      Concepto,
      ConceptoReglaFiscal,
    ]),
  ],
  controllers: [ConceptosController],
  providers: [ConceptosService],
  exports: [ConceptosService],
})
export class ConceptosModule {}
