import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Rol } from '../common/enums/rol.enum';
import { Empleado } from '../empleados/entities/empleado.entity';

@Entity('usuario')
export class Usuario extends BaseEntity {
  @PrimaryGeneratedColumn()
  usuarioId: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombreUsuario: string;

  @Column({ type: 'varchar', length: 200, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20 })
  rol: Rol;

  @Column({ type: 'int', nullable: true })
  empleadoId: number | null;

  @ManyToOne(() => Empleado, { nullable: true })
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado | null;
}
