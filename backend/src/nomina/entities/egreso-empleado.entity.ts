import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
@Entity('EgresoEmpleado')
export class EgresoEmpleado {
  @PrimaryGeneratedColumn({ name: 'EgresoId' })
  egresoId: number;
 
  @Column({ name: 'EmpleadoId' })
  empleadoId: number;
 
  @Column({ name: 'TipoEgresoId' })
  tipoEgresoId: number;
 
  @Column({ name: 'Periodo', type: 'date' })
  periodo: string;
 
  @Column({ name: 'Monto', type: 'decimal', precision: 12, scale: 2 })
  monto: number;
}