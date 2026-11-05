import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

@Entity('departamento')
export class Departamento extends BaseEntity {
  @PrimaryGeneratedColumn()
  departamentoId: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 20 })
  cuentaContable: string;
}
