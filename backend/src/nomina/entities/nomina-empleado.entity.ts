import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { Empleado } from "../../empleados/entities/empleado.entity";
import { Periodo } from "../../periodos/entities/periodo.entity";
import { NominaDetalle } from "./nomina-detalle.entity";

@Entity("NominaEmpleado")
export class NominaEmpleado extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "NominaEmpleadoId" })
    nominaEmpleadoId: number;

    @Column({ name: "EmpleadoId", type: "int" })
    empleadoId: number;

    @ManyToOne(() => Empleado)
    @JoinColumn({ name: "EmpleadoId" })
    empleado: Empleado;

    @Column({ name: "PeriodoId", type: "int" })
    periodoId: number;

    @ManyToOne(() => Periodo)
    @JoinColumn({ name: "PeriodoId" })
    periodo: Periodo;

    @Column({ name: "TipoNomina", type: "varchar", length: 10 })
    tipoNomina: "ANTICIPO" | "FINMES";

    @Column({
        name: "TotalPercepciones",
        type: "decimal",
        precision: 12,
        scale: 2,
        default: 0,
    })
    totalPercepciones: number;

    @Column({
        name: "TotalDeducciones",
        type: "decimal",
        precision: 12,
        scale: 2,
        default: 0,
    })
    totalDeducciones: number;

    @Column({
        name: "TotalProvisiones",
        type: "decimal",
        precision: 12,
        scale: 2,
        default: 0,
    })
    totalProvisiones: number;

    @Column({
        name: "Anticipo",
        type: "decimal",
        precision: 12,
        scale: 2,
        default: 0,
    })
    anticipo: number;

    @Column({
        name: "Liquido",
        type: "decimal",
        precision: 12,
        scale: 2,
        default: 0,
    })
    liquido: number;

    @Column({ name: "Estado", type: "varchar", length: 10, default: "ABIERTA" })
    estado: "ABIERTA" | "CERRADA";

    @Column({
        name: "FechaCalculo",
        type: "datetime",
        default: () => "GETDATE()",
    })
    fechaCalculo: Date;

    @OneToMany(() => NominaDetalle, (detalle) => detalle.nominaEmpleado)
    detalles: NominaDetalle[];
}
