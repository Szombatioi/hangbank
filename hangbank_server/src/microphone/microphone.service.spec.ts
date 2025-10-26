import { Test, TestingModule } from '@nestjs/testing';
import { MicrophoneService } from './microphone.service';

describe('MicrophoneService', () => {
  let service: MicrophoneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MicrophoneService],
    }).compile();

    service = module.get<MicrophoneService>(MicrophoneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
