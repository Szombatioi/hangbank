import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './entities/createUser.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,){

    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async createUser(data: CreateUserDto) {
        const user = await this.userRepository.save(data);
    }
}
