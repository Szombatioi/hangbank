import { AudioBlock } from "src/audio_block/entities/audio_block.entity";
import { Corpus } from "src/corpus/entities/corpus.entity";
import { Metadata } from "src/metadata/entities/metadata.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Dataset {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: false})
    name: string;

    //TODO: add Mode? (Convo based might be different...)

    // @Column({ nullable: false })
    // corpus_minio_link: string;

    @ManyToOne(() => User, (u) => u.datasets, {nullable: false})
    creator: User;

    @OneToOne(() => Metadata, (metadata) => metadata.dataset, { cascade: true , onDelete: 'CASCADE'}) //if we delete the dataset, delete the metadata too
    @JoinColumn()
    metadata: Metadata;

    @OneToMany(() => AudioBlock, (audioBlock) => audioBlock.dataset)
    audioBlocks: AudioBlock[];

    @ManyToOne(() => Corpus, {nullable: true}) //can be null, in order to use the Conversaton-based solution (its corpus is uploaded later)
    corpus: Corpus;
}
