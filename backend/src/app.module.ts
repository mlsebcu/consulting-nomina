import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConceptosModule } from './conceptos/conceptos.module';
import { validateEnv } from './config/env.validation';
import { typeOrmConfigFactory } from './database/database.config';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { HealthController } from './health.controller';
import { InicioModule } from './inicio/inicio.module';
import { NominaModule } from './nomina/nomina.module';
import { NovedadesModule } from './novedades/novedades.module';
import { ParametrosModule } from './parametros/parametros.module';
import { PeriodosModule } from './periodos/periodos.module';
import { ReportesModule } from './reportes/reportes.module';
import { UsuariosModule } from './usuarios/usuarios.module';

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
