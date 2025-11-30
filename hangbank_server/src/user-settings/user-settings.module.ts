import { Module } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsController } from './user-settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSettings } from './entities/user-setting.entity';
import { LanguageModule } from 'src/language/language.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSettings]),
    LanguageModule
  ],
  controllers: [UserSettingsController],
  providers: [UserSettingsService],
  exports: [UserSettingsService]
})
export class UserSettingsModule {}
