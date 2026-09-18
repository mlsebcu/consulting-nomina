import { ApiProperty } from "@nestjs/swagger";
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min,
} from "class-validator";

export class CreateConceptoDto {
    @ApiProperty({ example: "100" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    codigo: string;

    @ApiProperty({ example: "Salario Base" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre: string;

    @ApiProperty({
        example: 1,
        description: "ID de la naturaleza del concepto",
    })
    @IsInt()
    @IsPositive()
    naturalezaId: number;

    @ApiProperty({
        example: "FIJO",
        enum: ["FIJO", "PORCENTAJE", "FORMULA", "MANUAL"],
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    tipoCalculo: string;

    @ApiProperty({ example: "5101-01", required: false })
    @IsString()
    @IsOptional()
    @MaxLength(20)
    cuentaContable?: string;

    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @Min(0)
    @IsOptional()
    orden?: number;

    @ApiProperty({ example: false, required: false })
    @IsBoolean()
    @IsOptional()
    esSistema?: boolean;
}
