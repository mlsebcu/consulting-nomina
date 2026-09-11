import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDateString, IsNumber } from 'class-validator';
 
export class CreateIngresoDto {
  @ApiProperty({ example: 1, description: 'ID del empleado' })
  @IsInt()
  @IsPositive()
  empleadoId: number;
 
  @ApiProperty({ example: 1, description: 'ID del tipo de ingreso - 1=Salario Base, 2=Horas Extra, 3=Bonif. Decreto, 4=Bonif. Producción, 5=Comisiones' })
  @IsInt()
  @IsPositive()
  tipoIngresoId: number; // 1=Salario Base, 2=Horas Extra, 3=Bonif. Decreto, 4=Bonif. Producción, 5=Comisiones
 
  @ApiProperty({ example: '2026-09-01', description: 'Periodo del ingreso (primer día del mes)' })
  @IsDateString()
  periodo: string; // primer día del mes, ej. '2026-09-01'
 
  @ApiProperty({ example: 1000, description: 'Monto del ingreso' })
  @IsNumber()
  @IsPositive()
  monto: number;
}