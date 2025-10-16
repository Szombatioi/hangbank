import { Test, TestingModule } from '@nestjs/testing';
import { AudioBlockService } from './audio_block.service';

describe('AudioBlockService', () => {
  let service: AudioBlockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudioBlockService],
    }).compile();

    service = module.get<AudioBlockService>(AudioBlockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
