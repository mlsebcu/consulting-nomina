import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Departamento } from '../../departamentos/entities/departamento.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('Empleado')
export class Empleado extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'EmpleadoId' })
  empleadoId: number;

  @Column({ name: 'CodigoEmpleado', length: 20, unique: true })
  codigoEmpleado: string;

  @Column({ name: 'Nombres', length: 100 })
  nombres: string;

  @Column({ name: 'Apellidos', length: 100 })
  apellidos: string;

  @Column({ name: 'DPI', length: 13, unique: true })
  dpi: string;

  @Column({ name: 'NIT', type: 'varchar', length: 15, nullable: true })
  nit: string | null;

  @Column({ name: 'FechaNacimiento', type: 'date' })
  fechaNacimiento: string;

  @Column({ name: 'Genero', length: 15 })
  genero: string;

  @Column({ name: 'EstadoCivil', length: 20 })
  estadoCivil: string;

  @Column({ name: 'Direccion', length: 250 })
  direccion: string;

  @Column({ name: 'TelefonoMovil', length: 15 })
  telefonoMovil: string;

  @Column({ name: 'CorreoPersonal', length: 100 })
  correoPersonal: string;

  @Column({ name: 'CorreoCorporativo', length: 100 })
  correoCorporativo: string;

  @Column({ name: 'ContactoEmergenciaNombre', length: 150 })
  contactoEmergenciaNombre: string;

  @Column({ name: 'ContactoEmergenciaTelefono', length: 15 })
  contactoEmergenciaTelefono: string;

  @Column({ name: 'Banco', length: 100 })
  banco: string;

  @Column({ name: 'TipoCuenta', length: 15 })
  tipoCuenta: string;

  @Column({ name: 'NumeroCuenta', length: 30 })
  numeroCuenta: string;

  @Column({ name: 'FechaIngreso', type: 'date' })
  fechaIngreso: string;

  @Column({ name: 'FechaBaja', type: 'date', nullable: true })
  fechaBaja: string | null;

  @Column({ name: 'Puesto', length: 100 })
  puesto: string;

  @Column({ name: 'SalarioBase', type: 'decimal', precision: 12, scale: 2 })
  salarioBase: number;

  @Column({ name: 'DiasLaborados', type: 'int', default: 30 })
  diasLaborados: number;

  @Column({ name: 'DepartamentoId' })
  departamentoId: number;

  @ManyToOne(() => Departamento)
  @JoinColumn({ name: 'DepartamentoId' })
  departamento: Departamento;
}