import { Injectable } from '@nestjs/common';
import { Nomina } from './entities/nomina.entity';
import { IngresoEmpleado } from './entities/ingreso-empleado.entity';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { EgresoEmpleado } from './entities/egreso-empleado.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateEgresoDto } from './dto/create-egreso.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NominaService {
    constructor(
    @InjectRepository(IngresoEmpleado)
    private readonly ingresoRepo: Repository<IngresoEmpleado>,
    @InjectRepository(EgresoEmpleado)
    private readonly egresoRepo: Repository<EgresoEmpleado>,
    @InjectRepository(Nomina)
    private readonly nominaRepo: Repository<Nomina>,
    private readonly dataSource: DataSource,
  ) {}
 
  // --- Captura manual de conceptos (los que no calcula el sistema) ---
 
  registrarIngreso(dto: CreateIngresoDto): Promise<IngresoEmpleado> {
    const ingreso = this.ingresoRepo.create(dto);
    return this.ingresoRepo.save(ingreso);
  }
 
  registrarEgreso(dto: CreateEgresoDto): Promise<EgresoEmpleado> {
    const egreso = this.egresoRepo.create(dto);
    return this.egresoRepo.save(egreso);
  }
 
  // --- Invocación de los procedimientos almacenados ---
 
  calcularAnticipo(periodo: string) {
    return this.dataSource.query(
      `EXEC dbo.sp_CalcularAnticipo @Periodo = @0`,
      [periodo],
    );
  }
 
  calcularFinMes(periodo: string) {
    return this.dataSource.query(
      `EXEC dbo.sp_CalcularNominaFinMes @Periodo = @0`,
      [periodo],
    );
  }
 
  cerrarNomina(periodo: string, tipoNomina: string) {
    return this.dataSource.query(
      `EXEC dbo.sp_CerrarNomina @Periodo = @0, @TipoNomina = @1`,
      [periodo, tipoNomina],
    );
  }
 
  // --- Consulta de nóminas ya calculadas ---
 
  listarPorPeriodo(periodo: string): Promise<Nomina[]> {
    return this.nominaRepo.find({ where: { periodo } });
  }
}
