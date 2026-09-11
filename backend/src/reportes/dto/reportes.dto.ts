import { IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MesQueryDto {
    @ApiProperty({ example: 9, description: 'Mes del periodo a consultar (1-12)' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    mes: number;
}

export class PeriodoQueryDto {
    @ApiProperty({ example: '2026-09-01', description: 'Periodo en formato YYYY-MM-DD, primer día del mes' })   
    @IsDateString()
    periodo: string; // 'YYYY-MM-DD', primer día del mes
}