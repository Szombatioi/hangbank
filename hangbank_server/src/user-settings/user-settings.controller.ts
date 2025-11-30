import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { CreateUserSettingDto } from './dto/create-user-setting.dto';
import { UpdateUserSettingDto } from './dto/update-user-setting.dto';
import { JwtAuthGuard } from 'src/jwt-auth.guard';

@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}
  
  @Get()
  @UseGuards(JwtAuthGuard)
  async findByToken(@Req() req) {
    // console.log(req);
    const userId = req.user.sub;
    return await this.userSettingsService.findByToken(userId);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateByToken(@Req() req, @Body() dto: UpdateUserSettingDto) {
    const userId = req.user.id;
    return await this.userSettingsService.updateByToken(userId, dto);
  }
}
