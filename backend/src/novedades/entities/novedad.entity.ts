import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Concepto } from '../../conceptos/entities/concepto.entity.js';
import { Empleado } from '../../empleados/entities/empleado.entity.js';
import { Periodo } from '../../periodos/entities/periodo.entity.js';

@Entity('novedad_nomina')
export class Novedad extends BaseEntity {
  @PrimaryGeneratedColumn()
  novedadId: number;

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

  @Column({ type: 'int' })
  conceptoId: number;

  @ManyToOne(() => Concepto)
  @JoinColumn({ name: 'concepto_id' })
  concepto: Concepto;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  cantidad: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  monto: number | null;

  @Column({ type: 'varchar', length: 250, nullable: true })
  observacion: string | null;
}
