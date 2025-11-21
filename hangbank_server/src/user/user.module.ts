import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserSettingsModule } from 'src/user-settings/user-settings.module';
import { UserSettings } from 'src/user-settings/entities/user-setting.entity';
import { LanguageModule } from 'src/language/language.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSettings]),
    LanguageModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
