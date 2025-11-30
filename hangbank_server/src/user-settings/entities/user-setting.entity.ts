import { Language } from 'src/language/entities/language.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Language, {
    eager: true,      // auto-load language (optional)
    nullable: false,  // require a language
  })
  @JoinColumn()
  language: Language;

  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
