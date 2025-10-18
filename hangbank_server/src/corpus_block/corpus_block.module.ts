import { Module } from '@nestjs/common';
import { CorpusBlockService } from './corpus_block.service';
import { CorpusBlockController } from './corpus_block.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorpusBlock } from './entities/corpus_block.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CorpusBlock]),
  ],
  controllers: [CorpusBlockController],
  providers: [CorpusBlockService],
  exports: [CorpusBlockService],
})
export class CorpusBlockModule {}
