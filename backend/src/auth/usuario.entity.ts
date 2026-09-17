import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Empleado } from '../empleados/entities/empleado.entity';

@Entity('Usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'UsuarioId', type: 'int' })
  usuarioId: number;

  @Column({ name: 'NombreUsuario', type: 'varchar', length: 50, unique: true })
  nombreUsuario: string;

  @Column({ name: 'PasswordHash', type: 'varchar', length: 200 })
  passwordHash: string;

  @Column({ name: 'Rol', type: 'varchar', length: 20 })
  rol: 'ADMIN' | 'RRHH';

  @Column({ name: 'EmpleadoId', type: 'int', nullable: true })
  empleadoId: number | null;

  @ManyToOne(() => Empleado, { nullable: true })
  @JoinColumn({ name: 'EmpleadoId' })
  empleado: Empleado | null;

  @Column({ name: 'Activo', type: 'bit', default: true })
  activo: boolean;

  @Column({ name: 'FechaCreacion', type: 'datetime', default: () => 'GETDATE()' })
  fechaCreacion: Date;

  @Column({ name: 'FechaModificacion', type: 'datetime', nullable: true })
  fechaModificacion: Date | null;

  @Column({ name: 'CreadoPor', type: 'int', nullable: true })
  creadoPor: number | null;

  @Column({ name: 'ModificadoPor', type: 'int', nullable: true })
  modificadoPor: number | null;

  @Column({ name: 'EliminadoPor', type: 'int', nullable: true })
  eliminadoPor: number | null;

  @Column({ name: 'FechaEliminacion', type: 'datetime', nullable: true })
  fechaEliminacion: Date | null;
}