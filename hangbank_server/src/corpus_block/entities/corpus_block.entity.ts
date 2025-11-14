import { Corpus } from 'src/corpus/entities/corpus.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum CorpusBlockStatus {
  todo = 0,
  warning = 1,
  done = 2,
}
@Entity()
export class CorpusBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  sequence: number;

  @Column({ nullable: false })
  filename: string;

  @Column({
    type: 'enum',
    enum: CorpusBlockStatus,
    default: CorpusBlockStatus.todo,
  })
  status: CorpusBlockStatus;

  @Column({ nullable: false })
  corpus_block_minio_link: string;

  @ManyToOne(() => Corpus, (corpus) => corpus.corpus_blocks)
  corpus: Corpus;
}
