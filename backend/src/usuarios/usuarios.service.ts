import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { BCRYPT_SALT_ROUNDS } from '../auth/auth.constants';
import { Usuario } from '../auth/usuario.entity';
import { Rol } from '../common/enums/rol.enum';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  findAll() {
    return this.usuarioRepo.find({
      order: { activo: 'DESC', nombreUsuario: 'ASC' },
    });
  }

  async create(dto: CreateUsuarioDto, usuarioId: number) {
    const existe = await this.usuarioRepo.exists({
      where: { nombreUsuario: dto.nombreUsuario },
    });
    if (existe) {
      throw new ConflictException(`El usuario ${dto.nombreUsuario} ya existe`);
    }

    const usuario = await this.usuarioRepo.save(
      this.usuarioRepo.create({
        nombreUsuario: dto.nombreUsuario,
        nombreCompleto: dto.nombreCompleto.trim(),
        rol: dto.rol,
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS),
        creadoPor: usuarioId,
      }),
    );
    return this.findOne(usuario.usuarioId);
  }

  async update(id: number, dto: UpdateUsuarioDto, usuarioId: number) {
    const usuario = await this.findOne(id);

    const pierdeAdministracion = dto.rol === Rol.RRHH || dto.activo === false;
    if (id === usuarioId && pierdeAdministracion) {
      throw new BadRequestException(
        'No puede quitarse el rol de administrador ni desactivar su propio usuario',
      );
    }

    Object.assign(usuario, dto, {
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });
    await this.usuarioRepo.save(usuario);
    return this.findOne(id);
  }

  async cambiarPassword(id: number, password: string, usuarioId: number) {
    await this.findOne(id);
    await this.usuarioRepo.update(id, {
      passwordHash: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS),
      modificadoPor: usuarioId,
      fechaModificacion: new Date(),
    });
    return { mensaje: 'Contraseña actualizada' };
  }

  private async findOne(id: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { usuarioId: id },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return usuario;
  }
}
