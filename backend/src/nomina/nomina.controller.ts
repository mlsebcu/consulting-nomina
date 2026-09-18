import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { NominaService } from "./nomina.service";
import { CalcularAnticipoDto } from "./dto/calcular-anticipo.dto";
import { Roles } from "../auth/roles.decorator";
import { Rol } from "../common/enums/rol.enum";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { UsuarioAutenticado } from "../common/interfaces/usuario-autenticado.interface";
import { CalcularNominaDto } from "./dto/calcular-nomina.dto";
import { CerrarNominaDto } from "./dto/cerrar-nomina.dto";

@ApiTags("Nómina")
@ApiBearerAuth()
@Controller("nomina")
export class NominaController {
  constructor(private readonly nominaService: NominaService) {}

  @Post("anticipo")
  @Roles(Rol.ADMIN, Rol.RRHH)
  calcularAnticipo(@Body() dto: CalcularAnticipoDto) {
    return this.nominaService.calcularAnticipo(dto.periodoId);
  }

  @Post("calcular")
  @Roles(Rol.ADMIN, Rol.RRHH)
  calcularNomina(@Body() dto: CalcularNominaDto) {
    return this.nominaService.calcularNomina(dto.periodoId);
  }

  @Post("cerrar")
  @Roles(Rol.ADMIN)
  cerrarNomina(
    @Body() dto: CerrarNominaDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.nominaService.cerrarNomina(dto.periodoId, user.usuarioId);
  }

  @Get("periodo/:periodoId")
  @Roles(Rol.ADMIN, Rol.RRHH)
  listarPorPeriodo(@Param("periodoId", ParseIntPipe) periodoId: number) {
    return this.nominaService.listarPorPeriodo(periodoId);
  }

  @Get(":id")
  @Roles(Rol.ADMIN, Rol.RRHH)
  obtenerUna(@Param("id", ParseIntPipe) id: number) {
    return this.nominaService.obtenerUna(id);
  }
}
