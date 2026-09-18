import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateDepartamentoDto {
    @ApiProperty({
        example: "Finanzas",
        description: "Nombre del departamento",
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre: string;

    @ApiProperty({
        example: "5101-01",
        description: "Cuenta contable asociada al departamento",
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    cuentaContable: string;
}
