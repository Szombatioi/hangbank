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
import { UpdateUserDto } from './dto/update-user-dto';
import { UserAuthDto } from './dto/user-auth-dto';
import { ChangePasswordDto } from './dto/change-password-dto';

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

  async findByToken(user: UserAuthDto){
    return this.findOneById(user.userId);
  }

  async modifyUser(user: UserAuthDto, dto: UpdateUserDto){
    const userEntity = await this.findOneById(user.userId);
    const {name} = dto;
    if(name) userEntity.name = name;

    this.userRepository.save(userEntity);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    console.log("Email: ", email)
    console.log("User service user: ", user);
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

  async changePassword(auth: UserAuthDto, dto: ChangePasswordDto){
    console.log("----AUTH----")
    const { userId, email } = auth;
    const { oldPassword, newPassword } = dto;

    console.log("Auth: ", userId, email)
    console.log("Dto: ", dto)

    // 1. Fetch the user with password
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    // console.log("User: ", user);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    console.log("User found")

    // 2. Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    console.log("Old password is correct")

    // 3. Hash new password
    const hashed = await bcrypt.hash(newPassword, 10)
    console.log("Hashed password: ", hashed);
    user.password = hashed;

    console.log("Saving password")
    // 4. Save
    await this.userRepository.update(
      { id: user.id },
      { password: hashed }
    );
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
