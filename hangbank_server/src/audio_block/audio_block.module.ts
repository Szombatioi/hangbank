import { Module } from '@nestjs/common';
import { AudioBlockService } from './audio_block.service';
import { AudioBlockController } from './audio_block.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioBlock } from './entities/audio_block.entity';
import { DatasetModule } from 'src/dataset/dataset.module';
import { SpeakerModule } from 'src/speaker/speaker.module';
import { MinioModule } from 'src/minio/minio.module';
import { CorpusBlockModule } from 'src/corpus_block/corpus_block.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AudioBlock]),
    DatasetModule,
    SpeakerModule,
    MinioModule,
    CorpusBlockModule
  ],
  controllers: [AudioBlockController],
  providers: [AudioBlockService],
})
export class AudioBlockModule {}
