import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

const JWT_SECRET_MIN_LENGTH = 32;
const PUERTO_MAXIMO = 65535;

export const ENTORNOS = ['development', 'test', 'production'] as const;

class EnvironmentVariables {
  @IsIn(ENTORNOS)
  NODE_ENV: (typeof ENTORNOS)[number] = 'development';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(PUERTO_MAXIMO)
  PORT?: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsOptional()
  @IsBooleanString()
  DB_SSL?: string;

  @IsString()
  @MinLength(JWT_SECRET_MIN_LENGTH)
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string = '8h';

  @IsString()
  @IsNotEmpty()
  CORS_ORIGINS: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const detalle = errors
      .map(
        (e) =>
          `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`,
      )
      .join('; ');
    throw new Error(`Configuración de entorno inválida. ${detalle}`);
  }

  return validated;
}
