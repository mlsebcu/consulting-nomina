import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodosService } from './periodos.service.js';
import { PeriodosController } from './periodos.controller.js';
import { Periodo } from './entities/periodo.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Periodo])],
  controllers: [PeriodosController],
  providers: [PeriodosService],
  exports: [PeriodosService],
})
export class PeriodosModule {}
