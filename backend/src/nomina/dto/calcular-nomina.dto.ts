import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
 
export class CalcularNominaDto {
  @ApiProperty({ example: '2026-09-01', description: 'Periodo de la nómina a calcular' })
  @IsDateString()
  periodo: string;
}
 