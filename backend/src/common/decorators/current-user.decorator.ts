import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UsuarioAutenticado } from '../interfaces/usuario-autenticado.interface.js';

export const CurrentUser = createParamDecorator(
  (data: keyof UsuarioAutenticado | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: UsuarioAutenticado }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
