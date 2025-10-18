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
      entities: [User, Metadata, Dataset, AudioBlock, CorpusBlock, Corpus],
      synchronize: true, //TODO: replace this with migrations in production
    }),
    MinioModule,
    UserModule,
    MetadataModule,
    DatasetModule,
    AudioBlockModule,
    CorpusBlockModule,
    CorpusModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
