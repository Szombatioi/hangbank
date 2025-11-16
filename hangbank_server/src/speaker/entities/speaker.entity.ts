import { Metadata } from 'src/metadata/entities/metadata.entity';
import { Microphone } from 'src/microphone/entities/microphone.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Speaker {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({nullable: false})
  currentAge: number;

  @Column({nullable: true})
  speechDialect: string; //Describes the current speech dialect of the speaker (e.g. having speech disorder)

  @ManyToOne(() => Microphone, { eager: true })
  microphone: Microphone;

  @ManyToOne(() => Metadata, (metadata) => metadata.speakers)
  metadata: Metadata;

  @Column()
  samplingFrequency: number;
}
