import { forwardRef, Module } from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { DatasetController } from './dataset.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dataset } from './entities/dataset.entity';
import { Metadata } from 'src/metadata/entities/metadata.entity';
import { UserModule } from 'src/user/user.module';
import { CorpusModule } from 'src/corpus/corpus.module';
import { Speaker } from 'src/speaker/entities/speaker.entity';
import { MicrophoneModule } from 'src/microphone/microphone.module';
import { LanguageModule } from 'src/language/language.module';
import { AiChatHistory } from 'src/ai_chat_history/entities/ai_chat_history.entity';
import { AiModel } from 'src/ai_model/entities/ai_model.entity';
import { AudioBlockModule } from 'src/audio_block/audio_block.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dataset, Metadata, Speaker, AiChatHistory, AiModel]),
    UserModule,
    CorpusModule,
    MicrophoneModule,
    LanguageModule,
    forwardRef(()=>AudioBlockModule)
  ],
  controllers: [DatasetController],
  providers: [DatasetService],
  exports: [DatasetService]
})
export class DatasetModule {}
