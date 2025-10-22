import { Dataset } from "src/dataset/entities/dataset.entity";
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @CreateDateColumn()
    created_at: Date;

    @OneToOne(() => Dataset, (dataset) => dataset.metadata, { onDelete: 'CASCADE' })
    dataset: Dataset;
}
