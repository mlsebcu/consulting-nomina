import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { CUENTA_CONTABLE_PATTERN } from '../../common/constants/validacion.js';
import { TipoCalculo } from '../../common/enums/nomina.enums.js';

export class CreateConceptoDto {
  @ApiProperty({ example: '106' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo: string;

  @ApiProperty({ example: 'Bono por Antigüedad' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  naturalezaId: number;

  @ApiProperty({ enum: TipoCalculo })
  @IsEnum(TipoCalculo)
  tipoCalculo: TipoCalculo;

  @ApiPropertyOptional({ example: '5101-07' })
  @IsOptional()
  @Matches(CUENTA_CONTABLE_PATTERN, {
    message: 'La cuenta contable debe tener el formato 0000-00',
  })
  cuentaContable?: string;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}
