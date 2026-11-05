import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Rol } from '../common/enums/rol.enum';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { CreateNovedadDto } from './dto/create-novedad.dto';
import { UpdateNovedadDto } from './dto/update-novedad.dto';
import { NovedadesService } from './novedades.service';

@ApiTags('Novedades')
@ApiBearerAuth()
@Roles(Rol.ADMIN, Rol.RRHH)
@Controller('novedades')
export class NovedadesController {
  constructor(private readonly novedadesService: NovedadesService) {}

  @Get('conceptos')
  conceptosCapturables() {
    return this.novedadesService.conceptosCapturables();
  }

  @Get()
  findByPeriodo(@Query('periodoId', ParseIntPipe) periodoId: number) {
    return this.novedadesService.findByPeriodo(periodoId);
  }

  @Post()
  create(
    @Body() dto: CreateNovedadDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.novedadesService.create(dto, user.usuarioId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNovedadDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.novedadesService.update(id, dto, user.usuarioId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.novedadesService.remove(id, user.usuarioId);
  }
}
