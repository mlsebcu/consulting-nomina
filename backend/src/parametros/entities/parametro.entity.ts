import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { TipoDatoParametro } from '../../common/enums/nomina.enums.js';

@Entity('parametro_nomina')
export class Parametro extends BaseEntity {
  @PrimaryGeneratedColumn()
  parametroId: number;

  @Column({ type: 'varchar', length: 40 })
  codigo: string;

  @Column({ type: 'varchar', length: 200 })
  descripcion: string;

  @Column({ type: 'varchar', length: 10 })
  tipoDato: TipoDatoParametro;

  @Column({ type: 'varchar', length: 50 })
  valor: string;

  @Column({ type: 'int' })
  anio: number;
}
