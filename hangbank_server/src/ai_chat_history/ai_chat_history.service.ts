import { Injectable } from '@nestjs/common';
import { CreateAiChatHistoryDto } from './dto/create-ai_chat_history.dto';
import { UpdateAiChatHistoryDto } from './dto/update-ai_chat_history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AiChatHistory } from './entities/ai_chat_history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AiChatHistoryService {
  constructor(
    @InjectRepository(AiChatHistory)
    private readonly aiChatHistoryRepository: Repository<AiChatHistory>,
  ) {}

  async findAnyByDatasetId(datasetId: string) {
    return await this.aiChatHistoryRepository.findOneOrFail({
      where: { dataset: { id: datasetId } },
    });
  }
  async create(createAiChatHistoryDto: CreateAiChatHistoryDto) {
    // const { aiModelId, datasetId, aiSent, createdAt, history } =
    //   createAiChatHistoryDto;
    
    // const dataset = await 

    // await this.aiChatHistoryRepository.save(await this.aiChatHistoryRepository.create({

    // }));
  }

  findAll() {
    return `This action returns all aiChatHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aiChatHistory`;
  }

  update(id: number, updateAiChatHistoryDto: UpdateAiChatHistoryDto) {
    return `This action updates a #${id} aiChatHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} aiChatHistory`;
  }
}
