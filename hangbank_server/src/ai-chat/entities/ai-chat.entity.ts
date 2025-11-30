
//This is an ai chat that was linked to a convo-based dataset

import { AiChatHistory } from "src/ai_chat_history/entities/ai_chat_history.entity";
import { AiModel } from "src/ai_model/entities/ai_model.entity";
import { Dataset } from "src/dataset/entities/dataset.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

//This contains which model we are speaking, the topic (if already chosen) and 
@Entity()
export class AiChat {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    //Nullable: if not selected yet
    @Column({nullable: true})
    topic: string;

    //AI model
    @ManyToOne(() => AiModel, { nullable: false })
    aiModel: AiModel;

    //Linked chat history
    @OneToMany(() => AiChatHistory, (ch) => ch.aiChat)
    aiChatHistory: AiChatHistory[];

    @OneToOne(() => Dataset, (dataset) => dataset.aiChat)
    dataset: Dataset;
}
