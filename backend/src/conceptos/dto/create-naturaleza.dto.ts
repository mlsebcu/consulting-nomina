import { ApiProperty } from "@nestjs/swagger";
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator";

export class CreateNaturalezaDto {
    @ApiProperty({ example: "PERCEPCION" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(15)
    codigo: string;

    @ApiProperty({ example: "Percepción" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    nombre: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    afectaNeto: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    esProvision: boolean;

    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(0)
    @IsOptional()
    orden?: number;
}
