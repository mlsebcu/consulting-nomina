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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { DepartamentosService } from "./departamentos.service";
import { CreateDepartamentoDto } from "./dto/create-departamento.dto";
import { UpdateDepartamentoDto } from "./dto/update-departamento.dto";
import { Roles } from "../auth/roles.decorator";
import { Rol } from "../common/enums/rol.enum";
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UsuarioAutenticado } from "../common/interfaces/usuario-autenticado.interface";

@ApiTags("Departamentos")
@ApiBearerAuth()
@Controller("departamentos")
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Post()
  @Roles(Rol.ADMIN)
  create(
    @Body() dto: CreateDepartamentoDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.departamentosService.create(dto, user.usuarioId);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.RRHH)
  findAll() {
    return this.departamentosService.findAll();
  }

  @Get(":id")
  @Roles(Rol.ADMIN, Rol.RRHH)
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.departamentosService.findOne(id);
  }

  @Patch(":id")
  @Roles(Rol.ADMIN)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDepartamentoDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.departamentosService.update(id, dto, user.usuarioId);
  }

  @Delete(":id")
  @Roles(Rol.ADMIN)
  remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.departamentosService.remove(id, user.usuarioId);
  }
}
