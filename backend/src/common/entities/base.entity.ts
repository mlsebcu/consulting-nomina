import { Column, CreateDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  fechaCreacion: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fechaModificacion: Date | null;

  @Column({ type: 'int', nullable: true })
  creadoPor: number | null;

  @Column({ type: 'int', nullable: true })
  modificadoPor: number | null;

  @Column({ type: 'int', nullable: true })
  eliminadoPor: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  fechaEliminacion: Date | null;
}
