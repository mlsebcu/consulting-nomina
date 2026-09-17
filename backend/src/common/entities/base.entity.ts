import { Column } from 'typeorm';

export abstract class BaseEntity {
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