import { CorpusBlock } from "src/corpus_block/entities/corpus_block.entity";
import { Dataset } from "src/dataset/entities/dataset.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AudioBlock {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    audio_minio_link: string;

    @ManyToOne(() => Dataset, (dataset) => dataset.id, { onDelete: 'CASCADE' })
    dataset: Dataset;

    @ManyToOne(() => User, (user) => user.id)
    user: User;

    //Corpus block ID
    @ManyToOne(() => CorpusBlock, (corpusBlock) => corpusBlock.id)
    corpusBlock: CorpusBlock;
}
