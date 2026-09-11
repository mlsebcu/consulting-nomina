import { IsDateString } from 'class-validator';
 
export class CalcularNominaDto {
  @IsDateString()
  periodo: string;
}
 