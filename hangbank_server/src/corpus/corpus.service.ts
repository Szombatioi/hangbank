import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCorpusDto } from './dto/create-corpus.dto';
import { UpdateCorpusDto } from './dto/update-corpus.dto';
import { MinioService } from 'src/minio/minio.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Corpus } from './entities/corpus.entity';
import { Repository } from 'typeorm';
import path from 'path';
import { spawn } from 'child_process';
import { CorpusBlockService } from 'src/corpus_block/corpus_block.service';
import { CorpusBlock } from 'src/corpus_block/entities/corpus_block.entity';
import * as fs from 'fs';
import { lookup as mimeLookup } from 'mime-types';
import { Readable } from 'stream';
import { FileCorpusService } from './corpus_splitter.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Injectable()
export class CorpusService {
  constructor(
    @Inject(forwardRef(() => MinioService)) private readonly minioService: MinioService,
    // @Inject() private readonly corpusBlockService: CorpusBlockService,
    private readonly corpusSplitter: FileCorpusService,
    @InjectRepository(CorpusBlock)
    private readonly corpusBlockRepository: Repository<CorpusBlock>,
    @InjectRepository(Corpus)
    private readonly corpusRepository: Repository<Corpus>,
  ) {}
  async create(dto: CreateCorpusDto, file: Express.Multer.File) {
    //Step 1. Uploading Corpus to MinIO
    const result = await this.minioService.uploadObject(file, 'corpus');

    console.log('Corpus MinIO success');

    //Generate Corpus entity in DB
    const corpus = this.corpusRepository.create({
      name: dto.name,
      language: dto.language,
      category: dto.category,
      corpus_minio_link: result.filename,
    });

    console.log('Corpus entity created');

    //Download the uploaded file temporarily
    const tempPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'corpus_splitter',
      'temp',
      file.originalname,
    );
    fs.writeFileSync(tempPath, file.buffer);
    console.log('Temp file downloaded');

    //Step 2. Generate Corpus Blocks from Corpus (((via Python script)))
    //Path of the corpus_converter.py script
    // const scriptPath = path.join(
    //   __dirname,
    //   '..',
    //   '..',
    //   '..',
    //   'corpus_splitter',
    //   'corpus_converter.py',
    // );
    //path of the file to be processed
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'corpus_splitter',
      'temp',
      file.originalname,
    );

    const outputDir = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'corpus_splitter',
      'output',
    );

    // const args = [scriptPath, filePath, '-o', outputDir];
    // const pythonProcess = spawn('python3', args);

    const blockFileNames: string[] =
      await this.corpusSplitter.convertFileToCorpus(filePath, outputDir);
    // let errorOutput = '';

    // pythonProcess.stdout.on('data', (data) => {
    //   const lines = data.toString(); //.split(/\r?\n/).filter(Boolean);
    //   blockFileNames.push(...lines);
    // });

    // pythonProcess.stderr.on('data', (data) => {
    //   // errorOutput += data.toString();
    //   console.log('Python error: ' + data.toString());
    // });

    // await new Promise<void>((resolve, reject) => {
    //   pythonProcess.on('close', (code) => {
    //     if (code === 0) {
    //       // filter out any non-filename lines if needed
    //       const filenames = blockFileNames.filter((line) =>
    //         line.endsWith('.txt'),
    //       );
    //       blockFileNames.length = 0;
    //       blockFileNames.push(...filenames);
    //       resolve();
    //     } else {
    //       reject(new Error(`Python exited with code ${code}`));
    //     }
    //   });
    // });
    console.log('Python script finished execution');
    console.log(blockFileNames);
    await this.corpusRepository.save(corpus);
    //Generate CorpusBlock entities in DB for each filename the Python script returned
    await blockFileNames.forEach(async (blockFileName, index) => {
      //path of text file (block #XYZ)
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'corpus_splitter',
        'output',
        blockFileName,
      );
      console.log("Start file load into buffer");
      const fileBuffer = fs.readFileSync(filePath);

      console.log("File read into Buffer");

      const mimetype = mimeLookup(filePath) || 'application/octet-stream';

      console.log("Block mime checked");

      //Creating a fake Multer file object to use MinIO upload function
      const fakeMulterFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: path.basename(filePath),
        encoding: '7bit',
        mimetype,
        size: fileBuffer.length,
        buffer: fileBuffer,
        stream: Readable.from(fileBuffer),
        destination: '',
        filename: path.basename(filePath),
        path: filePath,
      };

      console.log("Starting block upload to MinIO");
      //Upload Corpus Block to MinIO to the 'corpus-blocks' bucket
      var blockRes = await this.minioService.uploadObject(
        fakeMulterFile,
        'corpus-blocks',
      );
      console.log('Corpus Block uploaded to MinIO: ' + blockRes.filename);

      const corpusBlock = await this.corpusBlockRepository.create({
        sequence: index+1,
        filename: blockRes.filename,
        corpus_block_minio_link: blockRes.filename, //returned by MinIO upload
      });
      corpusBlock.corpus = corpus;
      await this.corpusBlockRepository.save(corpusBlock);
      //no need to set corpus.corpus_blocks
    });

    //Step . Save everything
    await this.corpusRepository.save(corpus);
    console.log('Success!');

    //Cleanup downloaded temp files
    //Remove Corpus file from the local disk
    //TODO: mutli-thread safety?
    const tempDir = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'corpus_splitter',
      'temp',
    );
    this.clearDirectory(tempDir);

    //Remove Corpus Blocks files from the local disk
    this.clearDirectory(outputDir);
  }

  async findAll() {
    const res = await this.corpusRepository.find({relations: {corpus_blocks: true}});
    const corporaWithCounts = res.map(corpus => ({
      ...corpus,
      total_blocks: corpus.corpus_blocks?.length ?? 0,
    }));

    return corporaWithCounts;
    
  }

  async findBlocks(id: string){
    const corpus = await this.corpusRepository.findOne({where: {id}, relations: {corpus_blocks: true}});
    if(!corpus){
      throw new NotFoundException();
    }

    const blocks_formatted = corpus.corpus_blocks.map(block => ({
      sequence: block.sequence,
      filename: block.filename,
      status: block.status
    }));
    
    return blocks_formatted;
  }

  async findOne(id: string, includeBlocks: boolean = false): Promise<Corpus> {
    const corpus = await this.corpusRepository.findOne({where: {id}, relations: includeBlocks ? {corpus_blocks: true} : {}});
    if(!corpus) throw new NotFoundException();
    return corpus;
  }

  update(id: number, updateCorpusDto: UpdateCorpusDto) {
    return `This action updates a #${id} corpus`;
  }

  remove(id: number) {
    return `This action removes a #${id} corpus`;
  }



  private clearDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) return;
  
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.lstatSync(filePath);
  
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true }); // remove subdirectory
      } else {
        fs.unlinkSync(filePath); // remove file
      }
    }
  }
}
