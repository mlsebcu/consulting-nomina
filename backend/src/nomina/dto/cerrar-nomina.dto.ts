import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn } from 'class-validator';
 
export class CerrarNominaDto {
  @ApiProperty({ example: '2026-09-01', description: 'Periodo de la nómina a cerrar' })
  @IsDateString()
  periodo: string;
 
  @ApiProperty({ example: 'ANTICIPO', description: 'Tipo de nómina a cerrar. ANTICIPO | FINMES' })
  @IsIn(['ANTICIPO', 'FINMES'])
  tipoNomina: 'ANTICIPO' | 'FINMES';
}