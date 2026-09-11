import { IsInt, IsPositive, IsDateString, IsNumber } from 'class-validator';
 
export class CreateEgresoDto {
  @IsInt()
  @IsPositive()
  empleadoId: number;
 
  @IsInt()
  @IsPositive()
  tipoEgresoId: number; // 3=Asociación Solidarista, 4=Descuento Tienda (1=IGSS y 2=ISR se calcula en el sistema)
 
  @IsDateString()
  periodo: string;
 
  @IsNumber()
  @IsPositive()
  monto: number;
}