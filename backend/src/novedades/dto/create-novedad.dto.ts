import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateNovedadDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  @IsPositive()
  empleadoId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  periodoId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  conceptoId: number;

  @ApiPropertyOptional({
    example: 8,
    description: 'Horas, para conceptos calculados por hora',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  cantidad?: number;

  @ApiPropertyOptional({
    example: 450.5,
    description: 'Importe, para conceptos de ingreso manual',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monto?: number;

  @ApiPropertyOptional({ example: 'Cierre de inventario' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  observacion?: string;
}
