import { IsDateString, IsInt, IsNotEmpty, isNotEmpty, IsNumber, IsPositive, IsString, Min } from "class-validator";

export class CreateEmpleadoDto {
        @IsString()
        @IsNotEmpty()
        nombre: string;
    
        @IsDateString()
        fechaNacimiento: string;
    
        @IsDateString()
        fechaIngreso: string;
    
        @IsNumber()
        @IsPositive()
        salarioBase: number;
    
        @IsInt()
        @Min(0)
        diasLaborados: number;
    
        @IsInt()
        @IsPositive()
        departamentoId: number;
}
