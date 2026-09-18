import { ApiProperty } from "@nestjs/swagger";
import {
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    Min,
} from "class-validator";

export class CreatePeriodoDto {
    @ApiProperty({ example: 2026 })
    @IsInt()
    @Min(2000)
    @Max(2100)
    anio: number;

    @ApiProperty({ example: 9 })
    @IsInt()
    @Min(1)
    @Max(12)
    mes: number;

    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @Min(1)
    @Max(2)
    @IsOptional()
    quincena?: number;

    @ApiProperty({ example: 17 })
    @IsInt()
    @Min(1)
    numeroPeriodo: number;

    @ApiProperty({ example: "QUINCENAL", enum: ["QUINCENAL", "MENSUAL"] })
    @IsString()
    @IsNotEmpty()
    tipoPeriodo: string;

    @ApiProperty({ example: "2026-09-01" })
    @IsDateString()
    fechaInicio: string;

    @ApiProperty({ example: "2026-09-15" })
    @IsDateString()
    fechaFin: string;
}
