import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'El nombre de usuario',
    example: 'john_doe'
  })
  @IsString()
  nombreUsuario: string;

  @ApiProperty({
    description: 'La contraseña del usuario',
    example: 'password123'
  })
  @IsString()
  @MinLength(6)
  password: string;
}
