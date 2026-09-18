import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive } from "class-validator";

export class CerrarNominaDto {
    @ApiProperty({ example: 2, description: "ID del periodo a cerrar" })
    @IsInt()
    @IsPositive()
    periodoId: number;
}
