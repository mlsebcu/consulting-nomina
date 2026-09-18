import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { Concepto } from "../../conceptos/entities/concepto.entity";
import { NominaEmpleado } from "./nomina-empleado.entity";

@Entity("NominaDetalle")
export class NominaDetalle extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "NominaDetalleId" })
    nominaDetalleId: number;

    @Column({ name: "NominaEmpleadoId", type: "int" })
    nominaEmpleadoId: number;

    @ManyToOne(() => NominaEmpleado, (nomina) => nomina.detalles)
    @JoinColumn({ name: "NominaEmpleadoId" })
    nominaEmpleado: NominaEmpleado;

    @Column({ name: "ConceptoId", type: "int" })
    conceptoId: number;

    @ManyToOne(() => Concepto)
    @JoinColumn({ name: "ConceptoId" })
    concepto: Concepto;

    @Column({ name: "ConceptoCodigo", type: "varchar", length: 20 })
    conceptoCodigo: string;

    @Column({ name: "ConceptoNombre", type: "varchar", length: 100 })
    conceptoNombre: string;

    @Column({ name: "NaturalezaCodigo", type: "varchar", length: 15 })
    naturalezaCodigo: string;

    @Column({ name: "Monto", type: "decimal", precision: 12, scale: 2 })
    monto: number;

    @Column({ name: "Orden", type: "int", default: 0 })
    orden: number;
}
