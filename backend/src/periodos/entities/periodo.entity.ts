import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { Usuario } from "../../auth/usuario.entity";

@Entity("Periodo")
export class Periodo extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "PeriodoId" })
    periodoId: number;

    @Column({ name: "Anio", type: "int" })
    anio: number;

    @Column({ name: "Mes", type: "int" })
    mes: number;

    @Column({ name: "Quincena", type: "int", nullable: true })
    quincena: number | null;

    @Column({ name: "NumeroPeriodo", type: "int" })
    numeroPeriodo: number;

    @Column({ name: "TipoPeriodo", type: "varchar", length: 10 })
    tipoPeriodo: string;

    @Column({ name: "FechaInicio", type: "date" })
    fechaInicio: string;

    @Column({ name: "FechaFin", type: "date" })
    fechaFin: string;

    @Column({ name: "Estado", type: "varchar", length: 15, default: "ABIERTO" })
    estado: string;

    @Column({ name: "FechaCierre", type: "datetime", nullable: true })
    fechaCierre: Date | null;

    @Column({ name: "CerradoPor", type: "int", nullable: true })
    cerradoPor: number | null;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: "CerradoPor" })
    usuarioCierre: Usuario | null;
}
