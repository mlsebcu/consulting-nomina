import type { Rol } from '../enums/rol.enum';

export interface UsuarioAutenticado {
  usuarioId: number;
  nombreUsuario: string;
  rol: Rol;
}
