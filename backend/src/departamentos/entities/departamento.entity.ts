import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity({ name: 'Departamento' })
export class Departamento {

    @PrimaryGeneratedColumn({ name: 'DepartamentoId' })
    departamentoId: number;

    @Column({ name: 'Nombre' })
    nombre: string;

    @Column({ name: 'CuentaContable' })
    cuentaContable: string;

}
