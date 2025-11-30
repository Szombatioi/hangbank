import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAiChatDto } from './dto/create-ai-chat.dto';
import { UpdateAiChatDto } from './dto/update-ai-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AiChat } from './entities/ai-chat.entity';
import { Repository } from 'typeorm';
import { AiModel } from 'src/ai_model/entities/ai_model.entity';
import { AiChatHistory } from 'src/ai_chat_history/entities/ai_chat_history.entity';
import { DatasetService } from 'src/dataset/dataset.service';

@Injectable()
export class AiChatService {
  constructor(
    @InjectRepository(AiChat)
    private readonly aiChatRepository: Repository<AiChat>,
    @InjectRepository(AiModel)
    private readonly aiModelRepository: Repository<AiModel>,
    @InjectRepository(AiChatHistory)
    private readonly aiChatHistoryRepository: Repository<AiChatHistory>,
    @Inject(forwardRef(() => DatasetService))
    private readonly datasetService: DatasetService,
  ) {}

  async create(createAiChatDto: CreateAiChatDto) {
    try {
      const { aiModelId, datasetId } = createAiChatDto;
      const aiModel = await this.aiModelRepository.findOne({
        where: { name: aiModelId },
      });
      if (!aiModel) {
        throw new NotFoundException('Ai model not found width ID: ', aiModelId);
      }

      const dataset = await this.datasetService.findOne(datasetId);

      return await this.aiChatRepository.save(
        await this.aiChatRepository.create({
          // topic: null, //Initially this is null
          aiModel: aiModel,
          aiChatHistory: [],
          dataset: dataset,
        }),
      );
    } catch (err) {
      throw err;
    }
  }

  findAll() {
    return `This action returns all aiChat`;
  }

  async findOne(id: string) {
    const aiChat = await this.aiChatRepository.findOne({where: {id}, relations: {
      aiChatHistory: true,
      aiModel: true
    }});

    if(!aiChat) throw new NotFoundException("Ai Chat not found with ID: ", id);
    return aiChat;
  }

  update(id: number, updateAiChatDto: UpdateAiChatDto) {
    return `This action updates a #${id} aiChat`;
  }

  remove(id: number) {
    return `This action removes a #${id} aiChat`;
  }
}
