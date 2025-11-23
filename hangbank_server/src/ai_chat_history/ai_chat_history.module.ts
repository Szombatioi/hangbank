import { Module } from '@nestjs/common';
import { AiChatHistoryService } from './ai_chat_history.service';
import { AiChatHistoryController } from './ai_chat_history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiChatHistory } from './entities/ai_chat_history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiChatHistory])
  ],
  controllers: [AiChatHistoryController],
  providers: [AiChatHistoryService],
  exports: [AiChatHistoryService]
})
export class AiChatHistoryModule {}
