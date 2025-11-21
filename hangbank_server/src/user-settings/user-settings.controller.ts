import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { CreateUserSettingDto } from './dto/create-user-setting.dto';
import { UpdateUserSettingDto } from './dto/update-user-setting.dto';

@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get(":uid")
  async findByToken(@Param("uid") uid: string) {
    return await this.userSettingsService.findByToken(uid);
  }

  @Put(":uid")
  async updateByToken(@Param("uid") uid: string, @Body() dto: UpdateUserSettingDto) {
    return await this.userSettingsService.updateByToken(uid, dto);
  }
}
