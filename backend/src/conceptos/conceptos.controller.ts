import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConceptosService } from './conceptos.service.js';
import { CreateConceptoDto } from './dto/create-concepto.dto.js';
import { UpdateConceptoDto } from './dto/update-concepto.dto.js';
import { Roles } from '../auth/roles.decorator.js';
import { Rol } from '../common/enums/rol.enum.js';
import { CreateNaturalezaDto } from './dto/create-naturaleza.dto.js';
import { UpdateNaturalezaDto } from './dto/update-naturaleza.dto.js';
import { CreateReglaFiscalDto } from './dto/create-regla-fiscal.dto.js';
import { UpdateReglaFiscalDto } from './dto/update-regla-fiscal.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';

@ApiTags('Conceptos')
@ApiBearerAuth()
@Controller('conceptos')
export class ConceptosController {
  constructor(private readonly conceptosService: ConceptosService) {}

  @Get('naturalezas')
  @Roles(Rol.ADMIN, Rol.RRHH)
  findAllNaturalezas() {
    return this.conceptosService.findAllNaturalezas();
  }

  @Post('naturalezas')
  @Roles(Rol.ADMIN)
  createNaturaleza(
    @Body() dto: CreateNaturalezaDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.conceptosService.createNaturaleza(dto, user.usuarioId);
  }

  @Get('naturalezas/:id')
  @Roles(Rol.ADMIN, Rol.RRHH)
  findOneNaturaleza(@Param('id', ParseIntPipe) id: number) {
    return this.conceptosService.findOneNaturaleza(id);
  }

  @Patch('naturalezas/:id')
  @Roles(Rol.ADMIN)
  updateNaturaleza(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNaturalezaDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.conceptosService.updateNaturaleza(id, dto, user.usuarioId);
  }

  @Delete('naturalezas/:id')
  @Roles(Rol.ADMIN)
  removeNaturaleza(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.conceptosService.removeNaturaleza(id, user.usuarioId);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.RRHH)
  findAllConceptos() {
    return this.conceptosService.findAllConceptos();
  }

  @Post()
  @Roles(Rol.ADMIN)
  createConcepto(
    @Body() dto: CreateConceptoDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.conceptosService.createConcepto(dto, user.usuarioId);
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.RRHH)
  findOneConcepto(@Param('id', ParseIntPipe) id: number) {
    return this.conceptosService.findOneConcepto(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN)
  updateConcepto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConceptoDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.conceptosService.updateConcepto(id, dto, user.usuarioId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  removeConcepto(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.conceptosService.removeConcepto(id, user.usuarioId);
  }

  @Get(':id/reglas-fiscales')
  @Roles(Rol.ADMIN, Rol.RRHH)
  findReglasFiscales(@Param('id', ParseIntPipe) id: number) {
    return this.conceptosService.findReglasFiscalesByConcepto(id);
  }

  @Post(':id/reglas-fiscales')
  @Roles(Rol.ADMIN)
  createReglaFiscal(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReglaFiscalDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.conceptosService.createReglaFiscal(id, dto, user.usuarioId);
  }

  @Patch(':id/reglas-fiscales/:reglaId')
  @Roles(Rol.ADMIN)
  updateReglaFiscal(
    @Param('id', ParseIntPipe) id: number,
    @Param('reglaId', ParseIntPipe) reglaId: number,
    @Body() dto: UpdateReglaFiscalDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.conceptosService.updateReglaFiscal(
      id,
      reglaId,
      dto,
      user.usuarioId,
    );
  }

  @Delete(':id/reglas-fiscales/:reglaId')
  @Roles(Rol.ADMIN)
  removeReglaFiscal(
    @Param('id', ParseIntPipe) id: number,
    @Param('reglaId', ParseIntPipe) reglaId: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.conceptosService.removeReglaFiscal(id, reglaId, user.usuarioId);
  }
}
