import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class PeriodoNominaDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  periodoId: number;
}
