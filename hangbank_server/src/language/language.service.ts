import { Injectable, NotFoundException } from '@nestjs/common';
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
    const languages = await this.languageRepository.find();
    const res = languages.map((l) => ({
      id: l.id,
      code: l.code,
      name: l.name,
      isTranslated: l.isTranslated
    }));
    console.log(res);
    return res;
  }

  async findOne(id: string) {
    const langauge = await this.languageRepository.findOne({where: {id}});
    if(!langauge) throw new NotFoundException("Language not found with ID: " + id);
    return langauge;
  }

  async findOneByCode(code: string) {
    const langauge = await this.languageRepository.findOne({where: {code}});
    if(!langauge) throw new NotFoundException("Language not found with code: " + code);
    return langauge;
  }

  update(id: number, updateLanguageDto: UpdateLanguageDto) {
    return `This action updates a #${id} language`;
  }

  remove(id: number) {
    return `This action removes a #${id} language`;
  }

  async seedLanguages() {
    const existingLanguages = await this.languageRepository.find();
    const languagesToSeed: {code: string, name: string, isTranslated: boolean}[] = [
      {
        code: 'en-US',
        name: 'English (US)',
        isTranslated: true,
      },
      {
        code: 'hu-HU',
        name: 'Hungarian',
        isTranslated: true,
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
