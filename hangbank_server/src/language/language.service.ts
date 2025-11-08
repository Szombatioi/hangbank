import { Injectable } from '@nestjs/common';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from './entities/language.entity';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>
  ){}

  create(createLanguageDto: CreateLanguageDto) {
    return 'This action adds a new language';
  }

  async findAll() {
    return await this.languageRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} language`;
  }

  update(id: number, updateLanguageDto: UpdateLanguageDto) {
    return `This action updates a #${id} language`;
  }

  remove(id: number) {
    return `This action removes a #${id} language`;
  }

  async seedLanguages() {
    const existingLanguages = await this.languageRepository.find();
    const languagesToSeed: Language[] = [
      {
        code: 'en-US',
        name: 'English (US)',
      },
      {
        code: 'hu-HU',
        name: 'Hungarian',
      }
    ];

    for (const languageData of languagesToSeed) {
      if(existingLanguages.some(l => l.code === languageData.code)) {
        console.log(`Langauge already exists: ${languageData.name}`);
        continue;
      }
      const language = this.languageRepository.create(languageData);
      await this.languageRepository.save(language);
      console.log(`Seeded language: ${language.name}`);
    }

    console.log('Languages seeding completed.');
  }
}
