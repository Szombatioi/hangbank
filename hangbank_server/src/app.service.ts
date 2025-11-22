import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User } from './user/entities/user.entity';
import { UserService } from './user/user.service';
import * as bcrypt from 'bcrypt';
import { UserResult } from './user/entities/userResult.dto';
import { CreateUserDto } from './user/entities/createUser.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppService {
  constructor(
    @Inject() private readonly usersService: UserService,
    private jwtService: JwtService
  ){}

  async validateUser(email: string, password: string): Promise<UserResult | null>{
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async generateToken(user: UserResult) {
    const payload = {
      sub: user.id,
      email: user.email
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }



  async register(createUserDto: CreateUserDto): Promise<User> {
    try{
      return await this.usersService.createUser(createUserDto);
    } catch(err){
      throw new BadRequestException("User already exists!");
    }

    // Check if user already exists
    // const existingUser = await this.usersService.findOne({
    //   where: [{ email }, { username }],
    // });
    // if (existingUser) {
    //   throw new BadRequestException("Email or username already taken");
    // }

    // // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // const newUser = await this.usersService.createUser({
    //   ...createUserDto,
    //   password: hashedPassword,
    // });

    // return newUser;
  }
}
