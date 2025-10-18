import { CorpusBlock } from "src/corpus_block/entities/corpus_block.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Corpus {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    corpus_minio_link: string;

    @OneToMany(() => CorpusBlock, (corpusBlock) => corpusBlock.corpus, { onDelete: 'CASCADE' })
    corpus_blocks: CorpusBlock[];
}
