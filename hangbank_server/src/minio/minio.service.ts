import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { Client } from 'minio';
import * as path from 'path';
import * as stream from 'stream';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly bucketName = 'audio-files';
  private readonly minioClient: Client;

  constructor() {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: Number(process.env.MINIO_PORT) || 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    });
    this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    const exists = await this.minioClient.bucketExists(this.bucketName).catch(() => false);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      this.logger.log(`Created bucket: ${this.bucketName}`);
    }
  }

  async uploadAudio(file: Express.Multer.File) {
    const objectName = `${Date.now()}-${path.basename(file.originalname)}`;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'test-metadata': 'value',
          'isCool': 'true',
        },
      );
      return {
        filename: objectName,
        url: `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${this.bucketName}/${objectName}`,
      };
    } catch (err) {
      this.logger.error('Error uploading file', err);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async downloadAudio(objectName: string): Promise<stream.Readable> {
    try {
        const stat = await this.minioClient.statObject(this.bucketName, objectName);
        console.log(`Metadata for downloaded audio: `);
        for(const key in stat.metaData) {
            console.log(`  ${key}: ${stat.metaData[key]}`);
        }
      return await this.minioClient.getObject(this.bucketName, objectName);
    } catch (err) {
      this.logger.error('Error downloading file', err);
      throw new InternalServerErrorException('Failed to download file');
    }
  }
}
