import { Corpus } from "src/corpus/entities/corpus.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CorpusBlock {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    corpus_block_minio_link: string;

    @ManyToOne(() => Corpus, (corpus) => corpus.corpus_blocks)
    corpus: Corpus;
}
