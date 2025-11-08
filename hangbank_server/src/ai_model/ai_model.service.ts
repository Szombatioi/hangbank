import { Inject, Injectable } from '@nestjs/common';
import { CreateAiModelDto } from './dto/create-ai_model.dto';
import { UpdateAiModelDto } from './dto/update-ai_model.dto';
import { AiModel } from './entities/ai_model.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AiModelService {
  constructor(
    @InjectRepository(AiModel) private readonly aiModelRepository: Repository<AiModel>
  ) {}

  create(createAiModelDto: CreateAiModelDto) {
    return 'This action adds a new aiModel';
  }

  async findAll() {
    return await this.aiModelRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} aiModel`;
  }

  update(id: number, updateAiModelDto: UpdateAiModelDto) {
    return `This action updates a #${id} aiModel`;
  }

  remove(id: number) {
    return `This action removes a #${id} aiModel`;
  }

  async seedAIModels() {
    const existingModels = await this.aiModelRepository.find();
    const modelsToSeed = [
      {
        name: 'Google Gemini',
        modelName: 'gemini-2.5-flash',
      }
    ];

    for (const modelData of modelsToSeed) {
      if(existingModels.some(m => m.name === modelData.name && m.modelName === modelData.modelName)) {
        console.log(`AI Model already exists: ${modelData.name}`);
        continue;
      }
      const model = this.aiModelRepository.create(modelData);
      await this.aiModelRepository.save(model);
      console.log(`Seeded AI Model: ${model.name}`);
    }

    console.log('AI Models seeding completed.');
  }
}
