import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../../auth/auth.constants.js';
import { Rol } from '../../common/enums/rol.enum.js';

const NOMBRE_USUARIO_PATTERN = /^[a-z0-9._-]{3,50}$/;
const NOMBRE_COMPLETO_MAX_LENGTH = 150;

export class PasswordDto {
  @ApiProperty({ example: '********' })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}

export class CreateUsuarioDto extends PasswordDto {
  @ApiProperty({ example: 'jperez' })
  @Matches(NOMBRE_USUARIO_PATTERN, {
    message:
      'El usuario debe tener de 3 a 50 caracteres: minúsculas, números, punto, guion o guion bajo',
  })
  nombreUsuario: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(NOMBRE_COMPLETO_MAX_LENGTH)
  nombreCompleto: string;

  @ApiProperty({ enum: Rol })
  @IsEnum(Rol)
  rol: Rol;
}

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(NOMBRE_COMPLETO_MAX_LENGTH)
  nombreCompleto?: string;

  @ApiPropertyOptional({ enum: Rol })
  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
