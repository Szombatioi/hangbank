import { forwardRef, Module } from '@nestjs/common';
import { CorpusService } from './corpus.service';
import { CorpusController } from './corpus.controller';
import { MinioModule } from 'src/minio/minio.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Corpus } from './entities/corpus.entity';
import { CorpusBlock } from 'src/corpus_block/entities/corpus_block.entity';
import { FileCorpusService } from './corpus_splitter.service';

@Module({
  imports: [
    forwardRef(() => MinioModule),
    TypeOrmModule.forFeature([Corpus, CorpusBlock]),
  ],
  controllers: [CorpusController],
  providers: [CorpusService, FileCorpusService],
  exports: [CorpusService],
})
export class CorpusModule {}
