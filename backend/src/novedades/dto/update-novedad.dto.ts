import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateNovedadDto } from './create-novedad.dto.js';

export class UpdateNovedadDto extends PartialType(
  OmitType(CreateNovedadDto, ['empleadoId', 'periodoId'] as const),
) {}
