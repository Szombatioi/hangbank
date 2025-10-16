import { UUID } from "crypto";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}