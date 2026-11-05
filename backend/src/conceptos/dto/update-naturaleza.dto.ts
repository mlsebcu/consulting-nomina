import { PartialType } from '@nestjs/swagger';
import { CreateNaturalezaDto } from './create-naturaleza.dto.js';

export class UpdateNaturalezaDto extends PartialType(CreateNaturalezaDto) {}
