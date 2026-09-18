import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity({ name: 'Departamento' })
export class Departamento extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'DepartamentoId' })
    departamentoId: number;

    @Column({ name: 'Nombre', type: 'varchar', length: 100 })
    nombre: string;

    @Column({ name: 'CuentaContable', type: 'varchar', length: 20 })
    cuentaContable: string;
}