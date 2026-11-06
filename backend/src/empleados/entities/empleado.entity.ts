import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import {
  EstadoCivil,
  Genero,
  TipoCuenta,
} from '../../common/enums/nomina.enums.js';
import { Departamento } from '../../departamentos/entities/departamento.entity.js';

@Entity('empleado')
export class Empleado extends BaseEntity {
  @PrimaryGeneratedColumn()
  empleadoId: number;

  @Column({ type: 'varchar', length: 20 })
  codigoEmpleado: string;

  @Column({ type: 'varchar', length: 100 })
  nombres: string;

  @Column({ type: 'varchar', length: 100 })
  apellidos: string;

  @Column({ type: 'varchar', length: 13 })
  dpi: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  nit: string | null;

  @Column({ type: 'date' })
  fechaNacimiento: string;

  @Column({ type: 'varchar', length: 15 })
  genero: Genero;

  @Column({ type: 'varchar', length: 20 })
  estadoCivil: EstadoCivil;

  @Column({ type: 'varchar', length: 250 })
  direccion: string;

  @Column({ type: 'varchar', length: 15 })
  telefonoMovil: string;

  @Column({ type: 'varchar', length: 100 })
  correoPersonal: string;

  @Column({ type: 'varchar', length: 100 })
  correoCorporativo: string;

  @Column({ type: 'varchar', length: 150 })
  contactoEmergenciaNombre: string;

  @Column({ type: 'varchar', length: 15 })
  contactoEmergenciaTelefono: string;

  @Column({ type: 'varchar', length: 100 })
  banco: string;

  @Column({ type: 'varchar', length: 15 })
  tipoCuenta: TipoCuenta;

  @Column({ type: 'varchar', length: 30 })
  numeroCuenta: string;

  @Column({ type: 'date' })
  fechaIngreso: string;

  @Column({ type: 'date', nullable: true })
  fechaBaja: string | null;

  @Column({ type: 'varchar', length: 100 })
  puesto: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  salarioBase: number;

  @Column({ type: 'int', default: 30 })
  diasLaborados: number;

  @Column({ type: 'int' })
  departamentoId: number;

  @ManyToOne(() => Departamento)
  @JoinColumn({ name: 'departamento_id' })
  departamento: Departamento;
}
