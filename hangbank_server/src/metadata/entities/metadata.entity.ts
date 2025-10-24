import { Dataset } from "src/dataset/entities/dataset.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Metadata {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    microphone: string; //shold we store both label and deviceID?

    //One (or many) Speaker(s)
    @ManyToMany(() => User)
    @JoinTable()
    speakers: User[]; //If using Mode 1, it will be a single user

    // @Column()
    // language: string; //TODO: make it a table?

    @Column({nullable: true})
    recording_context: string;

    @CreateDateColumn()
    created_at: Date;

    @OneToOne(() => Dataset, (dataset) => dataset.metadata, { onDelete: 'CASCADE' })
    dataset: Dataset;
}
