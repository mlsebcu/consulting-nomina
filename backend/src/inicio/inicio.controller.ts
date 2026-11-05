import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../common/enums/rol.enum';
import { InicioService } from './inicio.service';

@ApiTags('Inicio')
@ApiBearerAuth()
@Controller('inicio')
export class InicioController {
  constructor(private readonly inicioService: InicioService) {}

  @Get('resumen')
  @Roles(Rol.ADMIN, Rol.RRHH)
  resumen() {
    return this.inicioService.resumen();
  }
}
