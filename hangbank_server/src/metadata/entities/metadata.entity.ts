import { Dataset } from "src/dataset/entities/dataset.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Metadata {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    microphone: string;

    @Column()
    language: string; //TODO: make it a table?

    @Column()
    recording_context: string;

    @OneToOne(() => Dataset, (dataset) => dataset.metadata, { onDelete: 'CASCADE' })
    dataset: Dataset;
}
