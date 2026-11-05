import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../auth/usuario.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { EstadoPeriodo, TipoPeriodo } from '../../common/enums/nomina.enums';

@Entity('periodo')
export class Periodo extends BaseEntity {
  @PrimaryGeneratedColumn()
  periodoId: number;

  @Column({ type: 'int' })
  anio: number;

  @Column({ type: 'int' })
  mes: number;

  @Column({ type: 'int', nullable: true })
  quincena: number | null;

  @Column({ type: 'int' })
  numeroPeriodo: number;

  @Column({ type: 'varchar', length: 10 })
  tipoPeriodo: TipoPeriodo;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date' })
  fechaFin: string;

  @Column({ type: 'varchar', length: 15, default: EstadoPeriodo.ABIERTO })
  estado: EstadoPeriodo;

  @Column({ type: 'timestamptz', nullable: true })
  fechaCierre: Date | null;

  @Column({ type: 'int', nullable: true })
  cerradoPor: number | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'cerrado_por' })
  usuarioCierre: Usuario | null;
}
