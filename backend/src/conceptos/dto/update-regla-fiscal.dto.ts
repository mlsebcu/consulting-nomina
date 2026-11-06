import { PartialType } from '@nestjs/swagger';
import { CreateReglaFiscalDto } from './create-regla-fiscal.dto.js';

export class UpdateReglaFiscalDto extends PartialType(CreateReglaFiscalDto) {}
