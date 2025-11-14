import { Module } from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { DatasetController } from './dataset.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dataset } from './entities/dataset.entity';
import { Metadata } from 'src/metadata/entities/metadata.entity';
import { UserModule } from 'src/user/user.module';
import { CorpusModule } from 'src/corpus/corpus.module';
import { Speaker } from 'src/speaker/entities/speaker.entity';
import { MicrophoneModule } from 'src/microphone/microphone.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dataset, Metadata, Speaker]),
    UserModule,
    CorpusModule,
    MicrophoneModule
  ],
  controllers: [DatasetController],
  providers: [DatasetService],
  exports: [DatasetService]
})
export class DatasetModule {}
