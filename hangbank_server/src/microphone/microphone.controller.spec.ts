import { Test, TestingModule } from '@nestjs/testing';
import { MicrophoneController } from './microphone.controller';
import { MicrophoneService } from './microphone.service';

describe('MicrophoneController', () => {
  let controller: MicrophoneController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MicrophoneController],
      providers: [MicrophoneService],
    }).compile();

    controller = module.get<MicrophoneController>(MicrophoneController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
