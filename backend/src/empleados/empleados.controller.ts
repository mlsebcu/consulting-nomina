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
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../common/enums/rol.enum';
import * as currentUserDecorator from '../common/decorators/current-user.decorator';

@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  @Roles(Rol.ADMIN)
  create(
    @Body() createEmpleadoDto: CreateEmpleadoDto,
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.UsuarioAutenticado,
  ) {
    return this.empleadosService.create(createEmpleadoDto, user.usuarioId);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.RRHH)
  findAll() {
    return this.empleadosService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.RRHH)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.UsuarioAutenticado,
  ) {
    return this.empleadosService.update(+id, updateEmpleadoDto, user.usuarioId);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.UsuarioAutenticado,
  ) {
    return this.empleadosService.remove(+id, user.usuarioId);
  }
}