import { PartialType } from "@nestjs/swagger";
import { CreateReglaFiscalDto } from "./create-regla-fiscal.dto";

export class UpdateReglaFiscalDto extends PartialType(CreateReglaFiscalDto) {}
