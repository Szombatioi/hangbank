import { Module } from '@nestjs/common';
import { AiChatHistoryService } from './ai_chat_history.service';
import { AiChatHistoryController } from './ai_chat_history.controller';

@Module({
  controllers: [AiChatHistoryController],
  providers: [AiChatHistoryService],
})
export class AiChatHistoryModule {}
