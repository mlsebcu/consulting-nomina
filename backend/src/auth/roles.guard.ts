import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import type { Rol } from '../common/enums/rol.enum';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];

    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    const rolesPermitidos = this.reflector.getAllAndOverride<Rol[]>(
      ROLES_KEY,
      targets,
    );
    if (!rolesPermitidos) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: UsuarioAutenticado }>();

    if (!user || !rolesPermitidos.includes(user.rol)) {
      throw new ForbiddenException('No tiene permisos para esta acción');
    }
    return true;
  }
}
