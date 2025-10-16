import { Metadata } from "src/metadata/entities/metadata.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Dataset {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    corpus_minio_link: string;

    @OneToOne(() => Metadata, (metadata) => metadata.dataset, { onDelete: 'CASCADE' })
    metadata: Metadata;
}
