import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Language {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    
    @Column()
    code: string; //e.g. "en-US", "hu-HU"

    @Column()
    name: string; //e.g. "English (US)", "Hungarian"

    @Column({default: false})
    isTranslated: boolean;
}
