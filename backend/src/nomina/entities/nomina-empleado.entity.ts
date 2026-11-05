import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { EstadoNomina, TipoNomina } from '../../common/enums/nomina.enums.js';
import { Empleado } from '../../empleados/entities/empleado.entity.js';
import { Periodo } from '../../periodos/entities/periodo.entity.js';
import { NominaDetalle } from './nomina-detalle.entity.js';

const MONTO = { type: 'numeric', precision: 12, scale: 2, default: 0 } as const;

@Entity('nomina_empleado')
export class NominaEmpleado extends BaseEntity {
  @PrimaryGeneratedColumn()
  nominaEmpleadoId: number;

  @Column({ type: 'int' })
  empleadoId: number;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @Column({ type: 'int' })
  periodoId: number;

  @ManyToOne(() => Periodo)
  @JoinColumn({ name: 'periodo_id' })
  periodo: Periodo;

  @Column({ type: 'varchar', length: 10 })
  tipoNomina: TipoNomina;

  @Column({ type: 'int', default: 0 })
  diasLaborados: number;

  @Column(MONTO)
  totalPercepciones: number;

  @Column(MONTO)
  totalDeducciones: number;

  @Column(MONTO)
  totalProvisiones: number;

  @Column(MONTO)
  anticipo: number;

  @Column(MONTO)
  liquido: number;

  @Column({ type: 'varchar', length: 10, default: EstadoNomina.ABIERTA })
  estado: EstadoNomina;

  @Column({ type: 'timestamptz' })
  fechaCalculo: Date;

  @OneToMany(() => NominaDetalle, (detalle) => detalle.nominaEmpleado)
  detalles: Relation<NominaDetalle[]>;
}
