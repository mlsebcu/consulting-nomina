import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import {
  ANIO_MAXIMO,
  ANIO_MINIMO,
  MESES_DEL_ANIO,
} from '../../common/constants/validacion';
import { TipoPeriodo } from '../../common/enums/nomina.enums';

export const QUINCENAS = [1, 2] as const;

export class CreatePeriodoDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(ANIO_MINIMO)
  @Max(ANIO_MAXIMO)
  anio: number;

  @ApiProperty({ example: 11 })
  @IsInt()
  @Min(1)
  @Max(MESES_DEL_ANIO)
  mes: number;

  @ApiPropertyOptional({ example: 1, enum: QUINCENAS })
  @IsOptional()
  @IsIn(QUINCENAS)
  quincena?: number;

  @ApiProperty({ example: 11 })
  @IsInt()
  @Min(1)
  numeroPeriodo: number;

  @ApiProperty({ enum: TipoPeriodo })
  @IsEnum(TipoPeriodo)
  tipoPeriodo: TipoPeriodo;

  @ApiProperty({ example: '2026-11-01' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ example: '2026-11-30' })
  @IsDateString()
  fechaFin: string;
}
