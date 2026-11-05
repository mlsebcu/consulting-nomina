import { PartialType } from '@nestjs/swagger';
import { CreateDepartamentoDto } from './create-departamento.dto.js';

export class UpdateDepartamentoDto extends PartialType(CreateDepartamentoDto) {}
