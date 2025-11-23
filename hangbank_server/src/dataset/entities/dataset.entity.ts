import { AiChatHistory } from "src/ai_chat_history/entities/ai_chat_history.entity";
import { AiModel } from "src/ai_model/entities/ai_model.entity";
import { AudioBlock } from "src/audio_block/entities/audio_block.entity";
import { Corpus } from "src/corpus/entities/corpus.entity";
import { Metadata } from "src/metadata/entities/metadata.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export enum RecordingMode{
    Corpus = 1,
    Conversation = 2
}
@Entity()
export class Dataset {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: false})
    name: string;

    @Column({nullable: false, type: "enum", enum: RecordingMode})
    mode: RecordingMode;

    // @Column({ nullable: false })
    // corpus_minio_link: string;

    @ManyToOne(() => User, (u) => u.datasets, {nullable: false})
    creator: User;

    @OneToOne(() => Metadata, (metadata) => metadata.dataset, { cascade: true , onDelete: 'CASCADE'}) //if we delete the dataset, delete the metadata too
    @JoinColumn()
    metadata: Metadata;

    @OneToMany(() => AudioBlock, (audioBlock) => audioBlock.dataset)
    audioBlocks: AudioBlock[];

    @ManyToOne(() => Corpus, {nullable: true}) //can be null, in order to use the Conversaton-based solution (its corpus is uploaded later)
    corpus: Corpus;

    @ManyToOne(() => AiModel, {nullable: true}) //can be null, in order to use the Conversaton-based solution (its corpus is uploaded later)
    aiModel: AiModel;
}