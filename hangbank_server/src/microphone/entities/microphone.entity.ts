import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Microphone {
    //TODO: make sure not to store redundant mics! (e.g. by deviceID)
    @PrimaryColumn()
    deviceId: string;

    @Column()
    label: string;
}
