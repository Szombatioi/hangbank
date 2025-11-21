import { UUID } from 'crypto';
import { AudioBlock } from 'src/audio_block/entities/audio_block.entity';
import { Dataset } from 'src/dataset/entities/dataset.entity';
import { UserSettings } from 'src/user-settings/entities/user-setting.entity';
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

//TODO: email, password etc.
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  birthdate: Date;

  @Column({ nullable: false, type: 'enum', enum: Gender })
  gender: Gender;

  // @OneToMany(() => AudioBlock, (audioBlock) => audioBlock)
  // audioBlocks: AudioBlock[];

  @OneToMany(() => Dataset, (d) => d.creator)
  datasets: Dataset[];

  //Auth elements
  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @OneToOne(() => UserSettings, (settings) => settings.user, { onDelete: "CASCADE", cascade: true })
  settings: UserSettings;
}
