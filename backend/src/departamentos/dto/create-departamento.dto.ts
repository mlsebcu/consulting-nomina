import { IsNotEmpty, IsString, MaxLength, maxLength } from "class-validator";

export class CreateDepartamentoDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    cuentaContable: string;
}
