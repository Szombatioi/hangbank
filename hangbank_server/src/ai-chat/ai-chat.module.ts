import { forwardRef, Module } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import { AiChatController } from './ai-chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiChat } from './entities/ai-chat.entity';
import { AiModel } from 'src/ai_model/entities/ai_model.entity';
import { AiChatHistory } from 'src/ai_chat_history/entities/ai_chat_history.entity';
import { DatasetModule } from 'src/dataset/dataset.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiChat, AiModel, AiChatHistory]),
    forwardRef(() => DatasetModule),
  ],
  controllers: [AiChatController],
  providers: [AiChatService],
  exports: [AiChatService],
})
export class AiChatModule {}
