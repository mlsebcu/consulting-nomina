import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

@Entity('naturaleza_concepto')
export class NaturalezaConcepto extends BaseEntity {
  @PrimaryGeneratedColumn()
  naturalezaId: number;

  @Column({ type: 'varchar', length: 15 })
  codigo: string;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'boolean', default: true })
  afectaNeto: boolean;

  @Column({ type: 'boolean', default: false })
  esProvision: boolean;

  @Column({ type: 'int', default: 0 })
  orden: number;
}
