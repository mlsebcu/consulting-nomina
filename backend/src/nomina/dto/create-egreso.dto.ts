import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDateString, IsNumber } from 'class-validator';
 
export class CreateEgresoDto {
  @ApiProperty({ example: 1, description: 'ID del empleado' })
  @IsInt()
  @IsPositive()
  empleadoId: number;
 
  @ApiProperty({ example: 3, description: 'ID del tipo de egreso - 3=Asociación Solidarista, 4=Descuento Tienda (1=IGSS y 2=ISR se calcula en el sistema)' })
  @IsInt()
  @IsPositive()
  tipoEgresoId: number; // 3=Asociación Solidarista, 4=Descuento Tienda (1=IGSS y 2=ISR se calcula en el sistema)
 
  @ApiProperty({ example: '2026-09-01', description: 'Periodo del egreso (primer día del mes)' })
  @IsDateString()
  periodo: string;
 
  @ApiProperty({ example: 1000, description: 'Monto del egreso' })
  @IsNumber()
  @IsPositive()
  monto: number;
}