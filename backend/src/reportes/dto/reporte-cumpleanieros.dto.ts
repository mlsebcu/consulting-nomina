import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

export class ReporteCumpleanierosDto {
    @ApiProperty({ example: 9, description: "Mes del 1 al 12" })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    mes: number;
}
