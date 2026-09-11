import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Departamento } from "../../departamentos/entities/departamento.entity";

@Entity('Empleado')
export class Empleado {
  @PrimaryGeneratedColumn({ name: 'EmpleadoId' })
  empleadoId: number;
 
  @Column({ name: 'Nombre' })
  nombre: string;
 
  @Column({ name: 'FechaNacimiento', type: 'date' })
  fechaNacimiento: string;
 
  @Column({ name: 'FechaIngreso', type: 'date' })
  fechaIngreso: string;
 
  @Column({ name: 'SalarioBase', type: 'decimal', precision: 12, scale: 2 })
  salarioBase: number;
 
  @Column({ name: 'DiasLaborados', default: 30 })
  diasLaborados: number;
 
  @Column({ name: 'DepartamentoId' })
  departamentoId: number;
 
  @ManyToOne(() => Departamento)
  @JoinColumn({ name: 'DepartamentoId' })
  departamento: Departamento;
 
  @Column({ name: 'Activo', default: true })
  activo: boolean;
}
