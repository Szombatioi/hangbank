import { AiChat } from "src/ai-chat/entities/ai-chat.entity";
import { AiModel } from "src/ai_model/entities/ai_model.entity";
import { Dataset } from "src/dataset/entities/dataset.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

//This is ONE chat text that is saved from a particular chat
@Entity()
export class AiChatHistory {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => AiChat, (c) => c.aiChatHistory, {onDelete: "CASCADE"})
    aiChat: AiChat;

    //Dataset - when you want to fetch the dataset's chat history you need to loop through the ai_chat_history table
    // @OneToOne(() => Dataset, { onDelete: 'CASCADE' })
    // @JoinColumn()
    // dataset: Dataset;

    @Column()
    aiSent: boolean; //Did the AI send the message

    //We store the human text to MinIO in order to train the TTS model (we need the text of the Audio)
    //Nullable, because the AI could sent messages that are not needed for training
    @Column({nullable: true})
    minio_link: string;

    @Column()
    createdAt: Date;

    //History - not nullable, because once you save, you have history
    @Column({nullable: false, type: "text"})
    history: string; //JSON string
}
