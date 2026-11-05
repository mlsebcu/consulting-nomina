import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PeriodosService } from './periodos.service.js';
import { CreatePeriodoDto } from './dto/create-periodo.dto.js';
import { UpdatePeriodoDto } from './dto/update-periodo.dto.js';
import { Roles } from '../auth/roles.decorator.js';
import { Rol } from '../common/enums/rol.enum.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';

@ApiTags('Periodos')
@ApiBearerAuth()
@Controller('periodos')
export class PeriodosController {
  constructor(private readonly periodosService: PeriodosService) {}

  @Get()
  @Roles(Rol.ADMIN, Rol.RRHH)
  findAll() {
    return this.periodosService.findAll();
  }

  @Get('abiertos')
  @Roles(Rol.ADMIN, Rol.RRHH)
  findAbiertos() {
    return this.periodosService.findAbiertos();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.RRHH)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.periodosService.findOne(id);
  }

  @Post()
  @Roles(Rol.ADMIN)
  create(
    @Body() dto: CreatePeriodoDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.periodosService.create(dto, user.usuarioId);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePeriodoDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.periodosService.update(id, dto, user.usuarioId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.periodosService.remove(id, user.usuarioId);
  }

  @Post(':id/cerrar')
  @Roles(Rol.ADMIN)
  cerrar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.periodosService.cerrar(id, user.usuarioId);
  }
}
