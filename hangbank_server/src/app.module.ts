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
      entities: [User, Metadata, Dataset],
      synchronize: true, //TODO: replace this with migrations in production
    }),
    MinioModule,
    UserModule,
    MetadataModule,
    DatasetModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
