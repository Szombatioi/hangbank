import { AudioBlock } from "src/audio_block/entities/audio_block.entity";
import { Metadata } from "src/metadata/entities/metadata.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Dataset {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    corpus_minio_link: string;

    @OneToOne(() => Metadata, (metadata) => metadata.dataset, { onDelete: 'CASCADE' }) //if we delete the dataset, delete the metadata too
    metadata: Metadata;

    @OneToMany(() => AudioBlock, (audioBlock) => audioBlock.dataset)
    audioBlocks: AudioBlock[];
}
