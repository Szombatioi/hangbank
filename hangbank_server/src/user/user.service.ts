import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './entities/createUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({where: {id}})
    if(!user) throw new NotFoundException();
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({where: {email}})
    if(!user) throw new NotFoundException();
    return user;
  }

  async createUser(data: CreateUserDto) {
    const { email, username, password } = data;
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });
    if (existingUser) throw new BadRequestException('User already exists!');

    // console.log("User does not exist")

    const hashedPassword = await bcrypt.hash(password, 10);

    // console.log("Hash ok")
    // console.log({...data, password: hashedPassword})
    return await this.userRepository.save(this.userRepository.create({
      ...data,
      password: hashedPassword,
    }));
  }
}
