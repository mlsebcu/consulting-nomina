import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { NominaService } from './nomina.service';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { Rol } from '../common/enums/rol.enum';
import { Roles } from '../auth/roles.decorator';
import { CreateEgresoDto } from './dto/create-egreso.dto';
import { CalcularNominaDto } from './dto/calcular-nomina.dto';
import { CerrarNominaDto } from './dto/cerrar-nomina.dto';

@Controller('nomina')
export class NominaController {
    constructor(private readonly nominaService: NominaService) {}
 
  // POST /nomina/ingresos
  @Post('ingresos')
  @Roles(Rol.ADMIN, Rol.RRHH)
  registrarIngreso(@Body() dto: CreateIngresoDto) {
    return this.nominaService.registrarIngreso(dto);
  }
 
  // POST /nomina/egresos
  @Post('egresos')
  @Roles(Rol.ADMIN, Rol.RRHH)
  registrarEgreso(@Body() dto: CreateEgresoDto) {
    return this.nominaService.registrarEgreso(dto);
  }
 
  // POST /nomina/calcular-anticipo
  @Post('calcular-anticipo')
  @Roles(Rol.ADMIN)
  calcularAnticipo(@Body() dto: CalcularNominaDto) {
    return this.nominaService.calcularAnticipo(dto.periodo);
  }
 
  // POST /nomina/calcular-fin-mes
  @Post('calcular-fin-mes')
  @Roles(Rol.ADMIN)
  calcularFinMes(@Body() dto: CalcularNominaDto) {
    return this.nominaService.calcularFinMes(dto.periodo);
  }
 
  // POST /nomina/cerrar
  @Post('cerrar')
  @Roles(Rol.ADMIN)
  cerrarNomina(@Body() dto: CerrarNominaDto) {
    return this.nominaService.cerrarNomina(dto.periodo, dto.tipoNomina);
  }
 
  // GET /nomina?periodo=2026-09-01
  @Get()
  @Roles(Rol.ADMIN, Rol.RRHH)
  listarPorPeriodo(@Query('periodo') periodo: string) {
    return this.nominaService.listarPorPeriodo(periodo);
  }
}
