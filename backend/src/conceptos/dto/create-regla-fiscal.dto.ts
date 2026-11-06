import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ANIO_MAXIMO, ANIO_MINIMO } from '../../common/constants/validacion.js';
import { TipoImpuesto } from '../../common/enums/nomina.enums.js';

const PORCENTAJE_MAXIMO = 100;
const CODIGO_PAIS_LONGITUD = 3;

export class CreateReglaFiscalDto {
  @ApiProperty({ example: 'GTM', description: 'Código ISO 3166-1 alfa-3' })
  @IsString()
  @Length(CODIGO_PAIS_LONGITUD, CODIGO_PAIS_LONGITUD)
  pais: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(ANIO_MINIMO)
  @Max(ANIO_MAXIMO)
  anio: number;

  @ApiProperty({ enum: TipoImpuesto })
  @IsEnum(TipoImpuesto)
  tipoImpuesto: TipoImpuesto;

  @ApiProperty({ example: true })
  @IsBoolean()
  esGravable: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  esBaseCalculo: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(PORCENTAJE_MAXIMO)
  porcentajeExencion?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  limiteExencion?: number;
}
