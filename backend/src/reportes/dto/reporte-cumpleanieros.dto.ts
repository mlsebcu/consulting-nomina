import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { MESES_DEL_ANIO } from '../../common/constants/validacion';

export class ReporteCumpleanierosDto {
  @ApiProperty({ example: 11, minimum: 1, maximum: MESES_DEL_ANIO })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MESES_DEL_ANIO)
  mes: number;
}
