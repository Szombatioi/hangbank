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

    @Column({ nullable: false })
    corpus_minio_link: string;

    @OneToMany(() => CorpusBlock, (corpusBlock) => corpusBlock.corpus, { onDelete: 'CASCADE' })
    corpus_blocks: CorpusBlock[];

    //We don't need to store that which datasets use this corpus
    // @OneToMany(() => Dataset, (dataset) => dataset.corpus)
    // datasets: Dataset[];
}
