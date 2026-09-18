import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { NaturalezaConcepto } from "./naturaleza-concepto.entity";

@Entity("Concepto")
export class Concepto extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "ConceptoId" })
    conceptoId: number;

    @Column({ name: "Codigo", type: "varchar", length: 20, unique: true })
    codigo: string;

    @Column({ name: "Nombre", type: "varchar", length: 100 })
    nombre: string;

    @Column({ name: "NaturalezaId", type: "int" })
    naturalezaId: number;

    @ManyToOne(() => NaturalezaConcepto)
    @JoinColumn({ name: "NaturalezaId" })
    naturaleza: NaturalezaConcepto;

    @Column({ name: "TipoCalculo", type: "varchar", length: 20 })
    tipoCalculo: string;

    @Column({
        name: "CuentaContable",
        type: "varchar",
        length: 20,
        nullable: true,
    })
    cuentaContable: string | null;

    @Column({ name: "Orden", type: "int", default: 0 })
    orden: number;

    @Column({ name: "EsSistema", type: "bit", default: false })
    esSistema: boolean;
}
