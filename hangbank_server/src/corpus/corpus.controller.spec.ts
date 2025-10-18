import { Test, TestingModule } from '@nestjs/testing';
import { CorpusController } from './corpus.controller';
import { CorpusService } from './corpus.service';

describe('CorpusController', () => {
  let controller: CorpusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorpusController],
      providers: [CorpusService],
    }).compile();

    controller = module.get<CorpusController>(CorpusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
