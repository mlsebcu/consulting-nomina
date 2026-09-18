import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { EmpleadosService } from "./empleados.service";
import { CreateEmpleadoDto } from "./dto/create-empleado.dto";
import { UpdateEmpleadoDto } from "./dto/update-empleado.dto";
import { Roles } from "../auth/roles.decorator";
import { Rol } from "../common/enums/rol.enum";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { UsuarioAutenticado } from "../common/interfaces/usuario-autenticado.interface";

@Controller("empleados")
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  @Roles(Rol.ADMIN)
  create(
    @Body() createEmpleadoDto: CreateEmpleadoDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.empleadosService.create(createEmpleadoDto, user.usuarioId);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.RRHH)
  findAll() {
    return this.empleadosService.findAll();
  }

  @Get(":id")
  @Roles(Rol.ADMIN, Rol.RRHH)
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.empleadosService.findOne(+id);
  }

  @Patch(":id")
  @Roles(Rol.ADMIN)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.empleadosService.update(+id, updateEmpleadoDto, user.usuarioId);
  }

  @Delete(":id")
  @Roles(Rol.ADMIN)
  remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser()
    user: UsuarioAutenticado,
  ) {
    return this.empleadosService.remove(+id, user.usuarioId);
  }
}
