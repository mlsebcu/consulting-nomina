import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';

const CREDENCIALES_INVALIDAS = 'Usuario o contraseña incorrectos';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(nombreUsuario: string, password: string) {
    const usuario = await this.validarCredenciales(nombreUsuario, password);

    const payload = {
      sub: usuario.usuarioId,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: {
        nombreUsuario: usuario.nombreUsuario,
        rol: usuario.rol,
      },
    };
  }

  private async validarCredenciales(nombreUsuario: string, password: string) {
    const usuario = await this.usuarioRepo.findOne({
      select: {
        usuarioId: true,
        nombreUsuario: true,
        rol: true,
        passwordHash: true,
      },
      where: { nombreUsuario, activo: true },
    });

    const passwordValida =
      usuario !== null &&
      (await bcrypt.compare(password, usuario.passwordHash));

    if (!usuario || !passwordValida) {
      throw new UnauthorizedException(CREDENCIALES_INVALIDAS);
    }

    return usuario;
  }
}
