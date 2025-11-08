import { Test, TestingModule } from '@nestjs/testing';
import { AiChatHistoryService } from './ai_chat_history.service';

describe('AiChatHistoryService', () => {
  let service: AiChatHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiChatHistoryService],
    }).compile();

    service = module.get<AiChatHistoryService>(AiChatHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
