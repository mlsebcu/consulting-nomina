import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsPositive } from "class-validator";

export class ReporteReciboDto {
    @ApiProperty({ example: 6, description: "ID de la nómina del empleado" })
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    nominaEmpleadoId: number;
}
