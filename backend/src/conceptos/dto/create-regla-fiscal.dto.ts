import { ApiProperty } from "@nestjs/swagger";
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    MaxLength,
    Min,
} from "class-validator";

export class CreateReglaFiscalDto {
    @ApiProperty({ example: "GTM" })
    @IsString()
    @Length(3, 3)
    pais: string;

    @ApiProperty({ example: 2026 })
    @IsInt()
    @Min(2000)
    anio: number;

    @ApiProperty({ example: "ISR", enum: ["ISR", "IGSS"] })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    tipoImpuesto: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    esGravable: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    esBaseCalculo: boolean;

    @ApiProperty({ example: 0, required: false })
    @IsNumber()
    @IsOptional()
    porcentajeExencion?: number;

    @ApiProperty({ example: 0, required: false })
    @IsNumber()
    @IsOptional()
    limiteExencion?: number;
}
