import { Entity, PrimaryColumn } from "typeorm";

@Entity()
export class AiModel {
    @PrimaryColumn()
    name: string; //e.g. Google Gemini
    
    @PrimaryColumn()
    modelName: string; //e.g. gemini-2.5-flash
}
