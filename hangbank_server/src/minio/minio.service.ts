import { Injectable, Logger, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { Client } from 'minio';
import * as path from 'path';
import { CorpusService } from 'src/corpus/corpus.service';
import { CorpusBlockService } from 'src/corpus_block/corpus_block.service';
import { CorpusBlock } from 'src/corpus_block/entities/corpus_block.entity';
import * as stream from 'stream';
import { CorpusBlockDTO } from './dto/corpus-block-dto';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly audioBucket = 'audio';
  private readonly corpusBucket = 'corpus';
  private readonly corpusBlockBucket = 'corpus-blocks';
  private readonly bucketNames = [this.audioBucket, this.corpusBucket, this.corpusBlockBucket];
  private readonly minioClient: Client;

  constructor(
    @Inject() private readonly corpusBlockService: CorpusBlockService,
    @Inject(forwardRef(() => CorpusService)) private readonly corpusService: CorpusService
  ) {
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

  //Uploads any kind of object
  async uploadObject(file: Express.Multer.File, bucket: string) {
    const objectName = `${Date.now()}-${path.basename(file.originalname)}`; //Creating unique object name

    //Validating if bucket exists
    if(!this.bucketNames.includes(bucket)){
      throw new InternalServerErrorException('Invalid bucket name');
    }

    try {
      //uploading object
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


  //Download any kind of object
  async downloadObject(objectName: string, bucket: string): Promise<stream.Readable> {
    //Validating if bucket exists
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


  //Retrieves an array of corpus blocks in [n-2, n+3] form
  async getCorpusBlockArray(corpusId: string, blockIndexFrom: number, blockIndexTo: number): Promise<CorpusBlockDTO[]> {
    if(blockIndexFrom > blockIndexTo || blockIndexFrom < 0){
      throw new InternalServerErrorException('Invalid block index range');
    }
    
    try{
      const corpus = await this.corpusService.findOne(corpusId, true);
      if(blockIndexTo >= corpus.corpus_blocks.length){
        throw new InternalServerErrorException('Block index out of range');
      }

      const corpusBlocks = corpus.corpus_blocks.sort((a, b) => a.sequence - b.sequence);
      const blocks: CorpusBlockDTO[] = [];
      for(let i = blockIndexFrom; i <= blockIndexTo; i++){
        const block = {
          corpusBlock: corpusBlocks[i],
          text: ""
        }
        const object = await this.downloadObject(corpus.corpus_blocks[i].corpus_block_minio_link, this.corpusBlockBucket);
        block.text = await this.streamToString(object);

        blocks.push(block);
      }

      return blocks;

    } catch(err){
      throw new InternalServerErrorException('Failed to fetch corpus');
    }
  }

  async streamToString(stream: stream.Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = '';
      stream.on('data', (chunk) => (data += chunk.toString()));
      stream.on('end', () => resolve(data));
      stream.on('error', (err) => reject(err));
    });
  }

}
