import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptosService } from './conceptos.service.js';
import { ConceptosController } from './conceptos.controller.js';
import { NaturalezaConcepto } from './entities/naturaleza-concepto.entity.js';
import { Concepto } from './entities/concepto.entity.js';
import { ConceptoReglaFiscal } from './entities/concepto-regla-fiscal.entity.js';

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
