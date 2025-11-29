import { forwardRef, Module } from '@nestjs/common';
import { AudioBlockService } from './audio_block.service';
import { AudioBlockController } from './audio_block.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioBlock } from './entities/audio_block.entity';
import { DatasetModule } from 'src/dataset/dataset.module';
import { SpeakerModule } from 'src/speaker/speaker.module';
import { MinioModule } from 'src/minio/minio.module';
import { CorpusBlockModule } from 'src/corpus_block/corpus_block.module';
import { AiModel } from 'src/ai_model/entities/ai_model.entity';
import { AiChatHistory } from 'src/ai_chat_history/entities/ai_chat_history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AudioBlock, AiModel, AiChatHistory]),
    forwardRef(()=>DatasetModule),
    SpeakerModule,
    MinioModule,
    CorpusBlockModule
  ],
  controllers: [AudioBlockController],
  providers: [AudioBlockService],
  exports: [AudioBlockService]
})
export class AudioBlockModule {}
