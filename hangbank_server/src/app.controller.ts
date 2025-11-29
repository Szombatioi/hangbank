import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDto } from './user/entities/createUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAudioBlockDto } from './audio_block/dto/create-audio_block.dto';
import { checkAudioQuality } from './modules/audio-quality-checker';

@Controller('api/auth')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.appService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    //Create JWT
    const jwtToken = await this.appService.generateToken(user);
    return {
      access_token: jwtToken.access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        birthdate: user.birthdate,
        gender: user.gender,
        username: user.username,
      },
    };
  }

  @Post('register')
  async register(@Body() data: CreateUserDto) {
    try {
      return this.appService.register(data);
    } catch (err) {
      return new BadRequestException('User already exists!');
    }
  }

  @Post('test-audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: process.env.NODE_ENV === 'development' ? undefined : undefined, // Alapértelmezésben a memóriát használja a NestJS/Multer
      limits: {
        fileSize: 500 * 1024 * 1024, //Max 500Mb
      },
    }),
  )
  test(@UploadedFile() audioFile: Express.Multer.File) {
    return checkAudioQuality(audioFile);
  }
}
