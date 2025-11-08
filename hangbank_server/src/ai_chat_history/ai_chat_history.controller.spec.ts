import { Test, TestingModule } from '@nestjs/testing';
import { AiChatHistoryController } from './ai_chat_history.controller';
import { AiChatHistoryService } from './ai_chat_history.service';

describe('AiChatHistoryController', () => {
  let controller: AiChatHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiChatHistoryController],
      providers: [AiChatHistoryService],
    }).compile();

    controller = module.get<AiChatHistoryController>(AiChatHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
