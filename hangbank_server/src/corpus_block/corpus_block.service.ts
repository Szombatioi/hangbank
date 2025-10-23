import { Injectable } from '@nestjs/common';
import { CreateCorpusBlockDto } from './dto/create-corpus_block.dto';
import { UpdateCorpusBlockDto } from './dto/update-corpus_block.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CorpusBlock } from './entities/corpus_block.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CorpusBlockService {
  constructor(
    @InjectRepository(CorpusBlock) private readonly corpusBlockRepository: Repository<CorpusBlock>,
  ) {}
  async create(sequence: number, filename: string, minioLink: string) {
    return await this.corpusBlockRepository.save(this.corpusBlockRepository.create({
      sequence: sequence,
      filename: filename,
      corpus_block_minio_link: minioLink
    }));
  }

  findAll() {
    return `This action returns all corpusBlock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} corpusBlock`;
  }

  update(id: number, updateCorpusBlockDto: UpdateCorpusBlockDto) {
    return `This action updates a #${id} corpusBlock`;
  }

  remove(id: number) {
    return `This action removes a #${id} corpusBlock`;
  }
}
