import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { TipoImpuesto } from '../../common/enums/nomina.enums';
import { Concepto } from './concepto.entity';

@Entity('concepto_regla_fiscal')
export class ConceptoReglaFiscal extends BaseEntity {
  @PrimaryGeneratedColumn()
  conceptoReglaFiscalId: number;

  @Column({ type: 'int' })
  conceptoId: number;

  @ManyToOne(() => Concepto)
  @JoinColumn({ name: 'concepto_id' })
  concepto: Concepto;

  @Column({ type: 'varchar', length: 3 })
  pais: string;

  @Column({ type: 'int' })
  anio: number;

  @Column({ type: 'varchar', length: 10 })
  tipoImpuesto: TipoImpuesto;

  @Column({ type: 'boolean', default: false })
  esGravable: boolean;

  @Column({ type: 'boolean', default: false })
  esBaseCalculo: boolean;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  porcentajeExencion: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  limiteExencion: number | null;
}
