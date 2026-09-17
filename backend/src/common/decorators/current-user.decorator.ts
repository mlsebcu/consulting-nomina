import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UsuarioAutenticado {
    usuarioId: number;
    nombreUsuario: string;
    rol: string;
}

export const CurrentUser = createParamDecorator(
    (data: keyof UsuarioAutenticado | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user: UsuarioAutenticado = request.user;
        return data ? user?.[data] : user;
    },
);