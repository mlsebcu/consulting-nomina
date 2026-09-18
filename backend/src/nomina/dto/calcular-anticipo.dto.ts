import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive } from "class-validator";

export class CalcularAnticipoDto {
    @ApiProperty({ example: 1, description: "ID del periodo quincenal" })
    @IsInt()
    @IsPositive()
    periodoId: number;
}
