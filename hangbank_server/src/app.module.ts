import { JwtModule } from "@nestjs/jwt";
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MinioModule } from './minio/minio.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { MetadataModule } from './metadata/metadata.module';
import { DatasetModule } from './dataset/dataset.module';
import { Dataset } from './dataset/entities/dataset.entity';
import { Metadata } from './metadata/entities/metadata.entity';
import { AudioBlockModule } from './audio_block/audio_block.module';
import { CorpusBlockModule } from './corpus_block/corpus_block.module';
import { AudioBlock } from './audio_block/entities/audio_block.entity';
import { CorpusBlock } from './corpus_block/entities/corpus_block.entity';
import { CorpusModule } from './corpus/corpus.module';
import { Corpus } from './corpus/entities/corpus.entity';
import { SpeakerModule } from './speaker/speaker.module';
import { MicrophoneModule } from './microphone/microphone.module';
import { Microphone } from './microphone/entities/microphone.entity';
import { Speaker } from './speaker/entities/speaker.entity';
import { AiModelModule } from './ai_model/ai_model.module';
import { AiChatHistoryModule } from './ai_chat_history/ai_chat_history.module';
import { AiModel } from './ai_model/entities/ai_model.entity';
import { AiChatHistory } from './ai_chat_history/entities/ai_chat_history.entity';
import { LanguageModule } from './language/language.module';
import { Language } from './language/entities/language.entity';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { UserSettings } from './user-settings/entities/user-setting.entity';
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, Metadata, Dataset, AudioBlock, CorpusBlock, Corpus, Microphone, Speaker, AiModel, AiChatHistory, Language, UserSettings],
      synchronize: true, //TODO: replace this with migrations in production
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "c76ed98e2e5f8b6e1fcba0d68222bd4faa9a9a15bdb7772c5ba3dbae1d264d62",
      signOptions: { expiresIn: "1h" },
    }),
    MinioModule,
    UserModule,
    MetadataModule,
    DatasetModule,
    AudioBlockModule,
    CorpusBlockModule,
    CorpusModule,
    SpeakerModule,
    MicrophoneModule,
    AiModelModule,
    AiChatHistoryModule,
    LanguageModule,
    UserSettingsModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
  exports: [JwtModule],
})
export class AppModule {}
