import { Dataset } from 'src/dataset/entities/dataset.entity';
import { Speaker } from 'src/speaker/entities/speaker.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Metadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column()
  // microphone: string; //shold we store both label and deviceID?

  //One (or many) Speaker(s)
  @OneToMany(() => Speaker, (speaker) => speaker.metadata)
  speakers: Speaker[]; //If using Mode 1, it will be a single user

  // @Column()
  // language: string;

  @Column({ nullable: true })
  recording_context: string;

  @Column({nullable: false})
  language: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => Dataset, (dataset) => dataset.metadata, {
    onDelete: 'CASCADE',
  })
  dataset: Dataset;
}
