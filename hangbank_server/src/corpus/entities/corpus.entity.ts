import { CorpusBlock } from "src/corpus_block/entities/corpus_block.entity";
import { Dataset } from "src/dataset/entities/dataset.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Corpus {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: false})
    name: string;

    @Column()
    language: string; //HU, EN etc.

    @Column({nullable: true})
    category: string; //e.g. News reading, Storytelling etc. -> but this is not mandatory

    //nullable because in Mode 2
    @Column({ nullable: true })
    corpus_minio_link: string;

    //When using mode 2, the corpus_blocks are initially empty, then filled during the talk with the AI model
    @OneToMany(() => CorpusBlock, (corpusBlock) => corpusBlock.corpus, { onDelete: 'CASCADE' })
    corpus_blocks: CorpusBlock[];

    //We don't need to store that which datasets use this corpus
    // @OneToMany(() => Dataset, (dataset) => dataset.corpus)
    // datasets: Dataset[];
}
