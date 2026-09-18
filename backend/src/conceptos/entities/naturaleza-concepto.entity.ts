import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("NaturalezaConcepto")
export class NaturalezaConcepto extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "NaturalezaId" })
    naturalezaId: number;

    @Column({ name: "Codigo", type: "varchar", length: 15, unique: true })
    codigo: string;

    @Column({ name: "Nombre", type: "varchar", length: 50 })
    nombre: string;

    @Column({ name: "AfectaNeto", type: "bit", default: true })
    afectaNeto: boolean;

    @Column({ name: "EsProvision", type: "bit", default: false })
    esProvision: boolean;

    @Column({ name: "Orden", type: "int", default: 0 })
    orden: number;
}
