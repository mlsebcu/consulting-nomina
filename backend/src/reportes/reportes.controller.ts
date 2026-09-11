import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../common/enums/rol.enum';
import { MesQueryDto, PeriodoQueryDto } from './dto/reportes.dto';

@ApiTags('reportes')
@ApiBearerAuth()
@Controller('reportes')
export class ReportesController {
    constructor(private readonly reportesService: ReportesService) { }

    @Get('cumpleanieros')
    @Roles(Rol.ADMIN, Rol.RRHH)
    cumpleanieros(@Query() query: MesQueryDto) {
        return this.reportesService.listadoCumpleanieros(query.mes);
    }

    @Get('igss')
    @Roles(Rol.ADMIN, Rol.RRHH)
    igss(@Query() query: PeriodoQueryDto) {
        return this.reportesService.listadoDescuentosIGSS(query.periodo);
    }

    @Get('isr')
    @Roles(Rol.ADMIN, Rol.RRHH)
    isr(@Query() query: PeriodoQueryDto) {
        return this.reportesService.listadoDescuentosISR(query.periodo);
    }

    @Get('poliza')
    @Roles(Rol.ADMIN) // información contable, solo ADMIN
    poliza(@Query() query: PeriodoQueryDto) {
        return this.reportesService.polizaContabilidad(query.periodo);
    }

    @Get('libro-salarios')
    @Roles(Rol.ADMIN, Rol.RRHH)
    libroSalarios(@Query() query: PeriodoQueryDto) {
        return this.reportesService.libroSalarios(query.periodo);
    }
}
