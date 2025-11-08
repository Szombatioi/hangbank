import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AiChatHistoryService } from './ai_chat_history.service';
import { CreateAiChatHistoryDto } from './dto/create-ai_chat_history.dto';
import { UpdateAiChatHistoryDto } from './dto/update-ai_chat_history.dto';

@Controller('ai-chat-history')
export class AiChatHistoryController {
  constructor(private readonly aiChatHistoryService: AiChatHistoryService) {}

  @Post()
  create(@Body() createAiChatHistoryDto: CreateAiChatHistoryDto) {
    return this.aiChatHistoryService.create(createAiChatHistoryDto);
  }

  @Get()
  findAll() {
    return this.aiChatHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiChatHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAiChatHistoryDto: UpdateAiChatHistoryDto) {
    return this.aiChatHistoryService.update(+id, updateAiChatHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiChatHistoryService.remove(+id);
  }
}
