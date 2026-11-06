import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  DIAS_MAXIMOS_MES,
  DPI_PATTERN,
} from '../../common/constants/validacion.js';
import {
  EstadoCivil,
  Genero,
  TipoCuenta,
} from '../../common/enums/nomina.enums.js';

export class CreateEmpleadoDto {
  @ApiProperty({ example: 'EMP-011' })
  @IsString()
  @Length(3, 20)
  codigoEmpleado: string;

  @ApiProperty({ example: 'Ana' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres: string;

  @ApiProperty({ example: 'López Méndez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidos: string;

  @ApiProperty({ example: '1234567890101' })
  @Matches(DPI_PATTERN, { message: 'El DPI debe tener 13 dígitos' })
  dpi: string;

  @ApiPropertyOptional({ example: '1234567' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  nit?: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  fechaNacimiento: string;

  @ApiProperty({ enum: Genero })
  @IsEnum(Genero)
  genero: Genero;

  @ApiProperty({ enum: EstadoCivil })
  @IsEnum(EstadoCivil)
  estadoCivil: EstadoCivil;

  @ApiProperty({ example: 'Zona 10, Ciudad de Guatemala' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  direccion: string;

  @ApiProperty({ example: '55551234' })
  @IsString()
  @MaxLength(15)
  telefonoMovil: string;

  @ApiProperty({ example: 'ana@correo.com' })
  @IsEmail()
  @MaxLength(100)
  correoPersonal: string;

  @ApiProperty({ example: 'ana.lopez@consulting.com' })
  @IsEmail()
  @MaxLength(100)
  correoCorporativo: string;

  @ApiProperty({ example: 'Carlos López' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  contactoEmergenciaNombre: string;

  @ApiProperty({ example: '55559876' })
  @IsString()
  @MaxLength(15)
  contactoEmergenciaTelefono: string;

  @ApiProperty({ example: 'Banco Industrial' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  banco: string;

  @ApiProperty({ enum: TipoCuenta })
  @IsEnum(TipoCuenta)
  tipoCuenta: TipoCuenta;

  @ApiProperty({ example: '3000001234' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  numeroCuenta: string;

  @ApiProperty({ example: '2024-01-02' })
  @IsDateString()
  fechaIngreso: string;

  @ApiProperty({ example: 'Analista' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  puesto: string;

  @ApiProperty({ example: 7500 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  salarioBase: number;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(0)
  @Max(DIAS_MAXIMOS_MES)
  diasLaborados: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  departamentoId: number;
}
