import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(nombreUsuario: string, password: string): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: { nombreUsuario, activo: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    return usuario;
  }

  async login(nombreUsuario: string, password: string) {
    const usuario = await this.validateUser(nombreUsuario, password);

    const payload = {
      sub: usuario.usuarioId,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      usuario: {
        nombreUsuario: usuario.nombreUsuario,
        rol: usuario.rol,
      },
    };
  }
}

