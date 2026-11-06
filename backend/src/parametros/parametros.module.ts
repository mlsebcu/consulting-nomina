import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parametro } from './entities/parametro.entity.js';
import { ParametrosController } from './parametros.controller.js';
import { ParametrosService } from './parametros.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Parametro])],
  controllers: [ParametrosController],
  providers: [ParametrosService],
})
export class ParametrosModule {}
