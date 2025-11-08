import { forwardRef, Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';
import { CorpusBlockModule } from 'src/corpus_block/corpus_block.module';
import { CorpusModule } from 'src/corpus/corpus.module';

@Module({
  imports: [forwardRef(() => CorpusModule), CorpusBlockModule],
  controllers: [MinioController],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
