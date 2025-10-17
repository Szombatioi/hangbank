import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { Client } from 'minio';
import * as path from 'path';
import * as stream from 'stream';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly audioBucket = 'audio';
  private readonly corpusBucket = 'corpus';
  private readonly corpusBlockBucket = 'corpus-blocks';
  private readonly bucketNames = [this.audioBucket, this.corpusBucket, this.corpusBlockBucket];
  private readonly minioClient: Client;

  constructor() {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: Number(process.env.MINIO_PORT) || 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    });
    this.ensureBucketsExists();
  }

  //Making sure all required buckets exist on MinIO server
  private async ensureBucketsExists() {
    this.bucketNames.forEach(async (bucketName) => {
      const exists = await this.minioClient.bucketExists(bucketName).catch(() => false);
      if (!exists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1');
        this.logger.log(`Created bucket: ${bucketName}`);
      }
    });
  }

  async uploadAudio(file: Express.Multer.File, bucket: string) {
    const objectName = `${Date.now()}-${path.basename(file.originalname)}`;

    if(!this.bucketNames.includes(bucket)){
      throw new InternalServerErrorException('Invalid bucket name');
    }

    try {
      //uploading audio object
      await this.minioClient.putObject(
        bucket,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      return {
        filename: objectName,
        url: `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${bucket}/${objectName}`,
      };
    } catch (err) {
      this.logger.error('Error uploading file', err);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async downloadAudio(objectName: string, bucket: string): Promise<stream.Readable> {
    if(!this.bucketNames.includes(bucket)){
      throw new InternalServerErrorException('Invalid bucket name');
    }

    try {
      //Fetching audio object - throws error if not found
      const stat = await this.minioClient.statObject(bucket, objectName);
      // console.log(`Metadata for downloaded audio: `);
      // for (const key in stat.metaData) {
      //   console.log(`  ${key}: ${stat.metaData[key]}`);
      // }
      return await this.minioClient.getObject(bucket, objectName);
    } catch (err) {
      this.logger.error('Error downloading file', err);
      throw new InternalServerErrorException('Failed to download file');
    }
  }
}
