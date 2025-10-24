import { UUID } from "crypto";
import { AudioBlock } from "src/audio_block/entities/audio_block.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum Gender {
    Male = "Male",
    Female = "Female",
    Other = "Other",
}

//TODO: email, password etc.
@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column( { nullable: false } )
    username: string;

    @Column( { nullable: false } )
    name: string;

    @Column( { nullable: false } )
    birthdate: Date;

    @Column( { nullable: false, type: "enum", enum: Gender,  } )
    gender: Gender;

    @OneToMany(() => AudioBlock, (audioBlock) => audioBlock.user)
    audioBlocks: AudioBlock[];

    //Auth elements
    @Column({nullable: false, unique: true})
    email: string;

    @Column({nullable: false})
    password: string;
}