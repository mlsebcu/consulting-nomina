import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ReportesService } from "./reportes.service";
import { ReporteCumpleanierosDto } from "./dto/reporte-cumpleanieros.dto";
import { Roles } from "../auth/roles.decorator";
import { Rol } from "../common/enums/rol.enum";

@ApiTags("Reportes")
@ApiBearerAuth()
@Controller("reportes")
export class ReportesController {
    constructor(private readonly reportesService: ReportesService) {}

    @Get("cumpleanieros")
    @Roles(Rol.ADMIN, Rol.RRHH)
    cumpleanieros(@Query() dto: ReporteCumpleanierosDto) {
        return this.reportesService.listadoCumpleanieros(dto.mes);
    }

    @Get("igss/:periodoId")
    @Roles(Rol.ADMIN, Rol.RRHH)
    igss(@Param("periodoId", ParseIntPipe) periodoId: number) {
        return this.reportesService.listadoIGSS(periodoId);
    }

    @Get("isr/:periodoId")
    @Roles(Rol.ADMIN, Rol.RRHH)
    isr(@Param("periodoId", ParseIntPipe) periodoId: number) {
        return this.reportesService.listadoISR(periodoId);
    }

    @Get("poliza/:periodoId")
    @Roles(Rol.ADMIN, Rol.RRHH)
    poliza(@Param("periodoId", ParseIntPipe) periodoId: number) {
        return this.reportesService.polizaContabilidad(periodoId);
    }

    @Get("libro-salarios/:periodoId")
    @Roles(Rol.ADMIN, Rol.RRHH)
    libroSalarios(@Param("periodoId", ParseIntPipe) periodoId: number) {
        return this.reportesService.libroSalarios(periodoId);
    }

    @Get("recibo/:nominaEmpleadoId")
    @Roles(Rol.ADMIN, Rol.RRHH)
    recibo(@Param("nominaEmpleadoId", ParseIntPipe) nominaEmpleadoId: number) {
        return this.reportesService.reciboNomina(nominaEmpleadoId);
    }
}
