import { Corpus } from 'src/corpus/entities/corpus.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum CorpusBlockStatus {
  warning,
  todo,
  done,
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
