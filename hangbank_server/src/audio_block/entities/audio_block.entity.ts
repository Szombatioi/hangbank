import { CorpusBlock } from "src/corpus_block/entities/corpus_block.entity";
import { Dataset } from "src/dataset/entities/dataset.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

//Important: Core idea is that audioblocks do not exist if you did not (yet) record audio for the specified corpus block
@Entity()
export class AudioBlock {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false }) //non-nullable, because of the "Important" note above
    audio_minio_link: string;

    @ManyToOne(() => Dataset, (dataset) => dataset.id, { onDelete: 'CASCADE' })
    dataset: Dataset;

    @ManyToOne(() => User, (user) => user.id) 
    user: User; //We need User here, because of Mode 2 (when 2 or more people have conversation)

    //Corpus block ID
    @ManyToOne(() => CorpusBlock, (corpusBlock) => corpusBlock.id)
    corpusBlock: CorpusBlock;
}
