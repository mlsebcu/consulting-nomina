import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { Concepto } from "./concepto.entity";

@Entity("ConceptoReglaFiscal")
export class ConceptoReglaFiscal extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "ConceptoReglaFiscalId" })
    conceptoReglaFiscalId: number;

    @Column({ name: "ConceptoId", type: "int" })
    conceptoId: number;

    @ManyToOne(() => Concepto)
    @JoinColumn({ name: "ConceptoId" })
    concepto: Concepto;

    @Column({ name: "Pais", type: "varchar", length: 3 })
    pais: string;

    @Column({ name: "Anio", type: "int" })
    anio: number;

    @Column({ name: "TipoImpuesto", type: "varchar", length: 10 })
    tipoImpuesto: string;

    @Column({ name: "EsGravable", type: "bit", default: false })
    esGravable: boolean;

    @Column({ name: "EsBaseCalculo", type: "bit", default: false })
    esBaseCalculo: boolean;

    @Column({
        name: "PorcentajeExencion",
        type: "decimal",
        precision: 5,
        scale: 2,
        nullable: true,
    })
    porcentajeExencion: number | null;

    @Column({
        name: "LimiteExencion",
        type: "decimal",
        precision: 12,
        scale: 2,
        nullable: true,
    })
    limiteExencion: number | null;
}
