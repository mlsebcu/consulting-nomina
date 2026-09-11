import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
@Entity('Nomina')
export class Nomina {
  @PrimaryGeneratedColumn({ name: 'NominaId' })
  nominaId: number;
 
  @Column({ name: 'EmpleadoId' })
  empleadoId: number;
 
  @Column({ name: 'Periodo', type: 'date' })
  periodo: string;
 
  @Column({ name: 'TipoNomina' })
  tipoNomina: 'ANTICIPO' | 'FINMES';
 
  @Column({ name: 'TotalIngresos', type: 'decimal', precision: 12, scale: 2 })
  totalIngresos: number;
 
  @Column({ name: 'TotalEgresos', type: 'decimal', precision: 12, scale: 2 })
  totalEgresos: number;
 
  @Column({ name: 'Liquido', type: 'decimal', precision: 12, scale: 2 })
  liquido: number;
 
  @Column({ name: 'Estado' })
  estado: 'ABIERTA' | 'CERRADA';
 
  @Column({ name: 'FechaCalculo', type: 'datetime' })
  fechaCalculo: Date;
}