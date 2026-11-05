import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Rol } from '../common/enums/rol.enum.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import {
  CreateUsuarioDto,
  PasswordDto,
  UpdateUsuarioDto,
} from './dto/usuario.dto.js';
import { UsuariosService } from './usuarios.service.js';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Roles(Rol.ADMIN)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Post()
  create(
    @Body() dto: CreateUsuarioDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.usuariosService.create(dto, user.usuarioId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.usuariosService.update(id, dto, user.usuarioId);
  }

  @Patch(':id/password')
  cambiarPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PasswordDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.usuariosService.cambiarPassword(
      id,
      dto.password,
      user.usuarioId,
    );
  }
}
