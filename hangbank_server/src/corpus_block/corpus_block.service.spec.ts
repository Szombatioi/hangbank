import { Test, TestingModule } from '@nestjs/testing';
import { CorpusBlockService } from './corpus_block.service';

describe('CorpusBlockService', () => {
  let service: CorpusBlockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorpusBlockService],
    }).compile();

    service = module.get<CorpusBlockService>(CorpusBlockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
