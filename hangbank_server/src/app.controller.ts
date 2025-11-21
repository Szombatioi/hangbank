import { BadRequestException, Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDto } from './user/entities/createUser.dto';

@Controller('api/auth')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('login')
  async login(@Body() body: {email: string, password: string}){
    const user = await this.appService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user; // return user data (no password)
  }

  @Post('register')
  async register(@Body() data: CreateUserDto){
    try{
      return this.appService.register(data);
    } catch(err){
      return new BadRequestException("User already exists!");
    }
  }
}
