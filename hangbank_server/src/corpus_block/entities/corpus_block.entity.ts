import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CorpusBlock {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    corpus_block_minio_link: string;

    @Column({ nullable: false })
    corpus_minio_link: string;
}
