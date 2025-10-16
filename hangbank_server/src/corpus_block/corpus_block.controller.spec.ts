import { Test, TestingModule } from '@nestjs/testing';
import { CorpusBlockController } from './corpus_block.controller';
import { CorpusBlockService } from './corpus_block.service';

describe('CorpusBlockController', () => {
  let controller: CorpusBlockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorpusBlockController],
      providers: [CorpusBlockService],
    }).compile();

    controller = module.get<CorpusBlockController>(CorpusBlockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
