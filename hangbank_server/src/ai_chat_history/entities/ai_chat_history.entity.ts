import { AiModel } from "src/ai_model/entities/ai_model.entity";
import { Dataset } from "src/dataset/entities/dataset.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AiChatHistory {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    //AI model
    @ManyToOne(() => AiModel, { nullable: false })
    ai_model: AiModel;

    //Dataset - when you want to fetch the dataset's chat history you need to loop through the ai_chat_history table
    @OneToOne(() => Dataset, { onDelete: 'CASCADE' })
    @JoinColumn()
    dataset: Dataset;

    //History - not nullable, because once you save, you have history
    @Column({nullable: false, type: "text"})
    history: string; //JSON string
}
