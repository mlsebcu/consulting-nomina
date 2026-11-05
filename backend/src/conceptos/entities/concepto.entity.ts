import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { TipoCalculo } from '../../common/enums/nomina.enums';
import { NaturalezaConcepto } from './naturaleza-concepto.entity';

@Entity('concepto')
export class Concepto extends BaseEntity {
  @PrimaryGeneratedColumn()
  conceptoId: number;

  @Column({ type: 'varchar', length: 20 })
  codigo: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'int' })
  naturalezaId: number;

  @ManyToOne(() => NaturalezaConcepto)
  @JoinColumn({ name: 'naturaleza_id' })
  naturaleza: NaturalezaConcepto;

  @Column({ type: 'varchar', length: 20 })
  tipoCalculo: TipoCalculo;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cuentaContable: string | null;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'boolean', default: false })
  esSistema: boolean;
}
