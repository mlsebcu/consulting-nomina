import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../common/enums/rol.enum';

@Controller('departamentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Post()
  @Roles(Rol.ADMIN)
  create(@Body() dto: CreateDepartamentoDto) {
    return this.departamentosService.create(dto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.RRHH)
  findAll() {
    return this.departamentosService.findAll();
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.RRHH)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDepartamentoDto) {
    return this.departamentosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.remove(id);
  }
}
