import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { ConceptosModule } from './conceptos/conceptos.module.js';
import { validateEnv } from './config/env.validation.js';
import { typeOrmConfigFactory } from './database/database.config.js';
import { DepartamentosModule } from './departamentos/departamentos.module.js';
import { EmpleadosModule } from './empleados/empleados.module.js';
import { HealthController } from './health.controller.js';
import { InicioModule } from './inicio/inicio.module.js';
import { NominaModule } from './nomina/nomina.module.js';
import { NovedadesModule } from './novedades/novedades.module.js';
import { ParametrosModule } from './parametros/parametros.module.js';
import { PeriodosModule } from './periodos/periodos.module.js';
import { ReportesModule } from './reportes/reportes.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfigFactory,
    }),
    AuthModule,
    DepartamentosModule,
    EmpleadosModule,
    ConceptosModule,
    ParametrosModule,
    PeriodosModule,
    NovedadesModule,
    NominaModule,
    ReportesModule,
    InicioModule,
    UsuariosModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
