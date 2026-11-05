import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TipoNomina } from '../common/enums/nomina.enums';
import { Rol } from '../common/enums/rol.enum';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { PeriodoNominaDto } from './dto/periodo-nomina.dto';
import { NominaService } from './nomina.service';

@ApiTags('Nómina')
@ApiBearerAuth()
@Controller('nomina')
export class NominaController {
  constructor(private readonly nominaService: NominaService) {}

  @Post('anticipo')
  @Roles(Rol.ADMIN, Rol.RRHH)
  calcularAnticipo(
    @Body() dto: PeriodoNominaDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.nominaService.calcularAnticipo(dto.periodoId, user.usuarioId);
  }

  @Post('calcular')
  @Roles(Rol.ADMIN, Rol.RRHH)
  calcularNomina(
    @Body() dto: PeriodoNominaDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.nominaService.calcularNomina(dto.periodoId, user.usuarioId);
  }

  @Post('cerrar')
  @Roles(Rol.ADMIN)
  cerrarNomina(
    @Body() dto: PeriodoNominaDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.nominaService.cerrarNomina(dto.periodoId, user.usuarioId);
  }

  @Get('periodo/:periodoId')
  @Roles(Rol.ADMIN, Rol.RRHH)
  @ApiQuery({ name: 'tipo', enum: TipoNomina, required: false })
  listarPorPeriodo(
    @Param('periodoId', ParseIntPipe) periodoId: number,
    @Query('tipo', new ParseEnumPipe(TipoNomina, { optional: true }))
    tipo?: TipoNomina,
  ) {
    return this.nominaService.listarPorPeriodo(periodoId, tipo);
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.RRHH)
  obtenerUna(@Param('id', ParseIntPipe) id: number) {
    return this.nominaService.obtenerUna(id);
  }
}
