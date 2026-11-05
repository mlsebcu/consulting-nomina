import type { Rol } from '../enums/rol.enum.js';

export interface UsuarioAutenticado {
  usuarioId: number;
  nombreUsuario: string;
  rol: Rol;
}
