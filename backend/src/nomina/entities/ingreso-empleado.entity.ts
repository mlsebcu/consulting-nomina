import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
@Entity('IngresoEmpleado')
export class IngresoEmpleado {
  @PrimaryGeneratedColumn({ name: 'IngresoId' })
  ingresoId: number;
 
  @Column({ name: 'EmpleadoId' })
  empleadoId: number;
 
  @Column({ name: 'TipoIngresoId' })
  tipoIngresoId: number;
 
  @Column({ name: 'Periodo', type: 'date' })
  periodo: string;
 
  @Column({ name: 'Monto', type: 'decimal', precision: 12, scale: 2 })
  monto: number;
}