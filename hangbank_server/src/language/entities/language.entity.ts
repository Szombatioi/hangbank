import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Language {
    @PrimaryColumn()
    code: string; //e.g. "en-US", "hu-HU"

    @Column()
    name: string; //e.g. "English (US)", "Hungarian"
}
