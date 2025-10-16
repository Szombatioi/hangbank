import { Test, TestingModule } from '@nestjs/testing';
import { AudioBlockController } from './audio_block.controller';
import { AudioBlockService } from './audio_block.service';

describe('AudioBlockController', () => {
  let controller: AudioBlockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudioBlockController],
      providers: [AudioBlockService],
    }).compile();

    controller = module.get<AudioBlockController>(AudioBlockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
