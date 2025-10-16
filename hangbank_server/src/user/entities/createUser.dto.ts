import { Gender } from "./user.entity";

export class CreateUserDto{
    username: string;
    name: string;
    birthdate: Date;
    gender: Gender;
}