import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Rol } from '../common/enums/rol.enum';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';

interface JwtPayload {
  sub: number;
  nombreUsuario: string;
  rol: Rol;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): UsuarioAutenticado {
    return {
      usuarioId: payload.sub,
      nombreUsuario: payload.nombreUsuario,
      rol: payload.rol,
    };
  }
}
