import { IsDateString, IsIn } from 'class-validator';
 
export class CerrarNominaDto {
  @IsDateString()
  periodo: string;
 
  @IsIn(['ANTICIPO', 'FINMES'])
  tipoNomina: 'ANTICIPO' | 'FINMES';
}