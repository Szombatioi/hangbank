import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserSettingDto } from './dto/create-user-setting.dto';
import { UpdateUserSettingDto } from './dto/update-user-setting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSettings } from './entities/user-setting.entity';
import { Repository } from 'typeorm';
import { LanguageService } from 'src/language/language.service';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings) private readonly userSettingsRepository: Repository<UserSettings>,
    @Inject() private readonly languageService: LanguageService
  ){}

  async findByToken(uid: string){
    const settings = await this.userSettingsRepository.findOne({where: {user: {id: uid}}, relations: {language: true}});
    if(!settings) throw new NotFoundException("Settings not found for user!");

    return {language: {
      id: settings.language.id,
      code: settings.language.code,
      name: settings.language.name,
    }};
  }

  async updateByToken(uid: string, dto: UpdateUserSettingDto){
    const settings = await this.userSettingsRepository.findOne({where: {user: {id: uid}}, relations: {language: true}});
    if(!settings) throw new NotFoundException("Settings not found for user!");

    const language = await this.languageService.findOne(dto.languageId);
    if(!language) throw new NotFoundException("Language not found!");

    settings.language = language;
    await this.userSettingsRepository.save(settings);
  }

  // create(createUserSettingDto: CreateUserSettingDto) {
  //   const user = await this.
  // }

  // findAll() {
  //   return `This action returns all userSettings`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} userSetting`;
  // }

  // update(id: number, updateUserSettingDto: UpdateUserSettingDto) {
  //   return `This action updates a #${id} userSetting`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} userSetting`;
  // }
}
