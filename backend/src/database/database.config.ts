import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { types } from 'pg';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from './snake-naming.strategy';

// node-postgres devuelve NUMERIC y BIGINT como texto para no perder precisión.
// Los montos de nómina ya vienen redondeados a centavos, por lo que se exponen como number.
const PG_OID_INT8 = 20;
const PG_OID_NUMERIC = 1700;
types.setTypeParser(PG_OID_INT8, (value) => Number.parseInt(value, 10));
types.setTypeParser(PG_OID_NUMERIC, (value) => Number.parseFloat(value));

export function buildDataSourceOptions(env: {
  DATABASE_URL?: string;
  DB_SSL?: string;
}): DataSourceOptions {
  return {
    type: 'postgres',
    url: env.DATABASE_URL,
    ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
  };
}

export function typeOrmConfigFactory(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    ...buildDataSourceOptions({
      DATABASE_URL: config.getOrThrow<string>('DATABASE_URL'),
      DB_SSL: config.get<string>('DB_SSL'),
    }),
    autoLoadEntities: true,
  };
}
