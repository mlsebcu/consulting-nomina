import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateEmpleadoDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  codigoEmpleado: string;

  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsString()
  @Length(13, 13)
  dpi: string;

  @IsString()
  @IsOptional()
  nit?: string;

  @IsDateString()
  fechaNacimiento: string;

  @IsString()
  genero: string;

  @IsString()
  estadoCivil: string;

  @IsString()
  direccion: string;

  @IsString()
  telefonoMovil: string;

  @IsEmail()
  correoPersonal: string;

  @IsEmail()
  correoCorporativo: string;

  @IsString()
  contactoEmergenciaNombre: string;

  @IsString()
  contactoEmergenciaTelefono: string;

  @IsString()
  banco: string;

  @IsString()
  tipoCuenta: string;

  @IsString()
  numeroCuenta: string;

  @IsDateString()
  fechaIngreso: string;

  @IsString()
  puesto: string;

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