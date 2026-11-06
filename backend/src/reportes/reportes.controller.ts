import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator.js';
import { Rol } from '../common/enums/rol.enum.js';
import { ReporteCumpleanierosDto } from './dto/reporte-cumpleanieros.dto.js';
import { ReportesService } from './reportes.service.js';

@ApiTags('Reportes')
@ApiBearerAuth()
@Roles(Rol.ADMIN, Rol.RRHH)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('cumpleanieros')
  cumpleanieros(@Query() dto: ReporteCumpleanierosDto) {
    return this.reportesService.listadoCumpleanieros(dto.mes);
  }

  @Get('igss/:periodoId')
  igss(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.reportesService.listadoIGSS(periodoId);
  }

  @Get('isr/:periodoId')
  isr(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.reportesService.listadoISR(periodoId);
  }

  @Get('poliza/:periodoId')
  poliza(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.reportesService.polizaContabilidad(periodoId);
  }

  @Get('libro-salarios/:periodoId')
  libroSalarios(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.reportesService.libroSalarios(periodoId);
  }

  @Get('recibo/:nominaEmpleadoId')
  recibo(@Param('nominaEmpleadoId', ParseIntPipe) nominaEmpleadoId: number) {
    return this.reportesService.reciboNomina(nominaEmpleadoId);
  }
}
