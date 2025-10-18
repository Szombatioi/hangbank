import { Test, TestingModule } from '@nestjs/testing';
import { CorpusService } from './corpus.service';

describe('CorpusService', () => {
  let service: CorpusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorpusService],
    }).compile();

    service = module.get<CorpusService>(CorpusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
