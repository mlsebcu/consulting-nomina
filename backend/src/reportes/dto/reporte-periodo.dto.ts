import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsPositive } from "class-validator";

export class ReportePeriodoDto {
    @ApiProperty({ example: 2, description: "ID del periodo" })
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    periodoId: number;
}
