import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { CUENTA_CONTABLE_PATTERN } from '../../common/constants/validacion.js';

export class CreateDepartamentoDto {
  @ApiProperty({ example: 'Finanzas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    example: '5101-10',
    description: 'Cuenta contable de gasto del departamento',
  })
  @IsString()
  @Matches(CUENTA_CONTABLE_PATTERN, {
    message: 'La cuenta contable debe tener el formato 0000-00',
  })
  cuentaContable: string;
}
