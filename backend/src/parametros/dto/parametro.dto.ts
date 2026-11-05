import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ANIO_MAXIMO, ANIO_MINIMO } from '../../common/constants/validacion';

export class UpdateParametroDto {
  @ApiProperty({ example: '4.83' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  valor: string;

  @ApiProperty({ example: 'Cuota laboral IGSS', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;
}

export class CopiarParametrosDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(ANIO_MINIMO)
  @Max(ANIO_MAXIMO)
  anioOrigen: number;

  @ApiProperty({ example: 2027 })
  @IsInt()
  @Min(ANIO_MINIMO)
  @Max(ANIO_MAXIMO)
  anioDestino: number;
}

export class ParametrosQueryDto {
  @ApiProperty({ example: 2026 })
  @Type(() => Number)
  @IsInt()
  @Min(ANIO_MINIMO)
  @Max(ANIO_MAXIMO)
  anio: number;
}
