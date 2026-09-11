import { IsInt, IsPositive, IsDateString, IsNumber } from 'class-validator';
 
export class CreateIngresoDto {
  @IsInt()
  @IsPositive()
  empleadoId: number;
 
  @IsInt()
  @IsPositive()
  tipoIngresoId: number; // 1=Salario Base, 2=Horas Extra, 3=Bonif. Decreto, 4=Bonif. Producción, 5=Comisiones
 
  @IsDateString()
  periodo: string; // primer día del mes, ej. '2026-09-01'
 
  @IsNumber()
  @IsPositive()
  monto: number;
}