import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { UsuarioAutenticado } from "../interfaces/usuario-autenticado.interface";

export const CurrentUser = createParamDecorator(
    (data: keyof UsuarioAutenticado | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user: UsuarioAutenticado = request.user;
        return data ? user?.[data] : user;
    },
);
