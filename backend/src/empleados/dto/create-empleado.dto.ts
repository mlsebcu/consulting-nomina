import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'Código único del empleado', example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  codigoEmpleado: string;

  @ApiProperty({ description: 'Nombres del empleado', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @ApiProperty({ description: 'Apellidos del empleado', example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @ApiProperty({ description: 'Número de identidad del empleado', example: '1234567890123' })
  @IsString()
  @Length(13, 13)
  dpi: string;

  @ApiProperty({ description: 'Número de identificación tributaria', example: '12345678' })
  @IsString()
  @IsOptional()
  nit?: string;

  @ApiProperty({ description: 'Fecha de nacimiento del empleado', example: '1990-01-01' })
  @IsDateString()
  fechaNacimiento: string;

  @ApiProperty({ description: 'Género del empleado', example: 'M' })
  @IsString()
  genero: string;

  @ApiProperty({ description: 'Estado civil del empleado', example: 'Soltero' })
  @IsString()
  estadoCivil: string;

  @ApiProperty({ description: 'Dirección del empleado', example: 'Calle Principal 123' })
  @IsString()
  direccion: string;

  @ApiProperty({ description: 'Número de teléfono móvil del empleado', example: '555-1234' })
  @IsString()
  telefonoMovil: string;

  @ApiProperty({ description: 'Correo electrónico personal del empleado', example: 'john.doe@example.com' })
  @IsEmail()
  correoPersonal: string;

  @ApiProperty({ description: 'Correo electrónico corporativo del empleado', example: 'john.doe@company.com' })
  @IsEmail()
  correoCorporativo: string;

  @ApiProperty({ description: 'Nombre del contacto de emergencia', example: 'Jane Doe' })
  @IsString()
  contactoEmergenciaNombre: string;

  @ApiProperty({ description: 'Teléfono del contacto de emergencia', example: '555-5678' })
  @IsString()
  contactoEmergenciaTelefono: string;

  @ApiProperty({ description: 'Nombre del banco', example: 'Banco Nacional' })
  @IsString()
  banco: string;

  @ApiProperty({ description: 'Tipo de cuenta', example: 'Monetaria' })
  @IsString()
  tipoCuenta: string;

  @ApiProperty({ description: 'Número de cuenta bancaria', example: '1234567890' })
  @IsString()
  numeroCuenta: string;

  @ApiProperty({ description: 'Fecha de ingreso del empleado', example: '2020-01-01' })
  @IsDateString()
  fechaIngreso: string;

  @ApiProperty({ description: 'Puesto del empleado', example: 'Desarrollador' })
  @IsString()
  puesto: string;

  @ApiProperty({ description: 'Salario base del empleado', example: 50000 })
  @IsNumber()
  @IsPositive()
  salarioBase: number;

  @ApiProperty({ description: 'Días laborados', example: 20 })
  @IsInt()
  @Min(0)
  diasLaborados: number;

  @ApiProperty({ description: 'ID del departamento', example: 1 })
  @IsInt()
  @IsPositive()
  departamentoId: number;
}