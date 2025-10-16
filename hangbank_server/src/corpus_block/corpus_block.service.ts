import { Injectable } from '@nestjs/common';
import { CreateCorpusBlockDto } from './dto/create-corpus_block.dto';
import { UpdateCorpusBlockDto } from './dto/update-corpus_block.dto';

@Injectable()
export class CorpusBlockService {
  create(createCorpusBlockDto: CreateCorpusBlockDto) {
    return 'This action adds a new corpusBlock';
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
