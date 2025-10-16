import { Module } from '@nestjs/common';
import { CorpusBlockService } from './corpus_block.service';
import { CorpusBlockController } from './corpus_block.controller';

@Module({
  controllers: [CorpusBlockController],
  providers: [CorpusBlockService],
})
export class CorpusBlockModule {}
