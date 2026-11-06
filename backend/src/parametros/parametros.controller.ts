import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Rol } from '../common/enums/rol.enum.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import {
  CopiarParametrosDto,
  ParametrosQueryDto,
  UpdateParametroDto,
} from './dto/parametro.dto.js';
import { ParametrosService } from './parametros.service.js';

@ApiTags('Parámetros')
@ApiBearerAuth()
@Controller('parametros')
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  @Get('anios')
  @Roles(Rol.ADMIN, Rol.RRHH)
  aniosDisponibles() {
    return this.parametrosService.aniosDisponibles();
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.RRHH)
  findByAnio(@Query() query: ParametrosQueryDto) {
    return this.parametrosService.findByAnio(query.anio);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParametroDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.parametrosService.update(id, dto, user.usuarioId);
  }

  @Post('copiar')
  @Roles(Rol.ADMIN)
  copiar(
    @Body() dto: CopiarParametrosDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.parametrosService.copiar(dto, user.usuarioId);
  }
}
