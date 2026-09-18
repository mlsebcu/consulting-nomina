import { PartialType } from "@nestjs/swagger";
import { CreateNaturalezaDto } from "./create-naturaleza.dto";

export class UpdateNaturalezaDto extends PartialType(CreateNaturalezaDto) {}
