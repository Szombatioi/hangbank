import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gender, User } from './entities/user.entity';
import { CreateUserDto } from './entities/createUser.dto';
import * as bcrypt from 'bcrypt';
import { UserSettingsService } from 'src/user-settings/user-settings.service';
import { UserSettings } from 'src/user-settings/entities/user-setting.entity';
import { LanguageService } from 'src/language/language.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>,
    @Inject()
    private readonly languageService: LanguageService
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException();
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
    const user = await this.userRepository.save(
      this.userRepository.create({
        ...data,
        password: hashedPassword,
      }),
    );
    const language = await this.languageService.findOneByCode("en-US");
    //Create settings for user
    const settings = await this.userSettingsRepository.create({
      user: user,
      language: language
    });
    await this.userSettingsRepository.save(settings);

    return user;
  }

  async seedAdmin() {
    const existingUsers = await this.userRepository.find();
    const usersToSeed: CreateUserDto[] = [
      {
        username: 'admin',
        name: 'Admin',
        birthdate: new Date(),
        gender: Gender.Other,
        email: 'admin@gmail.com',
        password: 'admin',
      },
    ];

    for (const userData of usersToSeed) {
      if (existingUsers.some((u) => u.email === userData.email)) {
        console.log(`User already exists: ${userData.name}`);
        continue;
      }
      const user = await this.createUser(userData);
      console.log(`Seeded user: ${user.name}`);
    }

    console.log('Users seeding completed.');
  }
}
