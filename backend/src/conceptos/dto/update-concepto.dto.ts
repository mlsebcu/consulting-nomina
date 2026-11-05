import { PartialType } from '@nestjs/swagger';
import { CreateConceptoDto } from './create-concepto.dto.js';

export class UpdateConceptoDto extends PartialType(CreateConceptoDto) {}
