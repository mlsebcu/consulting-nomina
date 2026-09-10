import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'UsuarioId', type: 'int' })
  usuarioId: number;

  @Column({
    name: 'NombreUsuario',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  nombreUsuario: string;

  @Column({
    name: 'PasswordHash',
    type: 'varchar',
    length: 200,
  })
  passwordHash: string;

  @Column({
    name: 'Rol',
    type: 'varchar',
    length: 20,
  })
  rol: 'ADMIN' | 'RRHH';

  @Column({
    name: 'EmpleadoId',
    type: 'int',
    nullable: true,
  })
  empleadoId: number | null;

  @Column({
    name: 'Activo',
    type: 'bit',
    default: true,
  })
  activo: boolean;
}