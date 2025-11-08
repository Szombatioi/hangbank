import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';
import type { Response } from 'express';

@Controller('minio')
export class MinioController {
  constructor(private readonly minioService: MinioService) { }

  private readonly acceptedDocumentMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain"
  ];

  @Post(':bucket/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Param('bucket') bucket: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    if (bucket === 'audio' && !file.mimetype.startsWith('audio/')) {
      throw new HttpException('Only audio files allowed', HttpStatus.BAD_REQUEST);
    }
    else if (bucket === 'corpus' && !this.acceptedDocumentMimeTypes.includes(file.mimetype)) {
      throw new HttpException('Only document files allowed', HttpStatus.BAD_REQUEST);
    }

    try {
      return this.minioService.uploadObject(file, bucket);
    } catch (error) {
      throw new HttpException('File upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  @Get(':bucket/download/:filename')
  async downloadFile(@Param('bucket') bucket: string, @Param('filename') filename: string, @Res() res: Response) {
    try {
      const fileStream = await this.minioService.downloadObject(filename, bucket);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      fileStream.pipe(res);
    }
    catch (error) {
      throw new HttpException('File download failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('blocks/:corpusId/:fromIndex/:toIndex')
  async getCorpusBlocksInRange(
    @Param('corpusId') corpusId: string,
    @Param('fromIndex') fromIndex: number,
    @Param('toIndex') toIndex: number,
  ) {
    try {
      return this.minioService.getCorpusBlockArray(corpusId, fromIndex, toIndex);
    } catch (error) {
      throw new HttpException('Failed to retrieve corpus blocks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
