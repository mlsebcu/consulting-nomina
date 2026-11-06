import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Concepto } from '../../conceptos/entities/concepto.entity.js';
import { NominaEmpleado } from './nomina-empleado.entity.js';

@Entity('nomina_detalle')
export class NominaDetalle extends BaseEntity {
  @PrimaryGeneratedColumn()
  nominaDetalleId: number;

  @Column({ type: 'int' })
  nominaEmpleadoId: number;

  @ManyToOne(() => NominaEmpleado, (nomina) => nomina.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'nomina_empleado_id' })
  nominaEmpleado: Relation<NominaEmpleado>;

  @Column({ type: 'int' })
  conceptoId: number;

  @ManyToOne(() => Concepto)
  @JoinColumn({ name: 'concepto_id' })
  concepto: Concepto;

  @Column({ type: 'varchar', length: 20 })
  conceptoCodigo: string;

  @Column({ type: 'varchar', length: 100 })
  conceptoNombre: string;

  @Column({ type: 'varchar', length: 15 })
  naturalezaCodigo: string;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  cantidad: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: number;

  @Column({ type: 'int', default: 0 })
  orden: number;
}
