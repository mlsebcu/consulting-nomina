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
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Rol } from '../common/enums/rol.enum';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { EmpleadosService } from './empleados.service';

@ApiTags('Empleados')
@ApiBearerAuth()
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.RRHH)
  create(
    @Body() dto: CreateEmpleadoDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.empleadosService.create(dto, user.usuarioId);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.RRHH)
  findAll() {
    return this.empleadosService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.RRHH)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.RRHH)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpleadoDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.empleadosService.update(id, dto, user.usuarioId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.empleadosService.remove(id, user.usuarioId);
  }
}
