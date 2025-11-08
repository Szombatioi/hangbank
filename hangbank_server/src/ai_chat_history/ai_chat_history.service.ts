import { Injectable } from '@nestjs/common';
import { CreateAiChatHistoryDto } from './dto/create-ai_chat_history.dto';
import { UpdateAiChatHistoryDto } from './dto/update-ai_chat_history.dto';

@Injectable()
export class AiChatHistoryService {
  create(createAiChatHistoryDto: CreateAiChatHistoryDto) {
    return 'This action adds a new aiChatHistory';
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
