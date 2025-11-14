import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOneById(id: string) {
    const corpusBlock = await this.corpusBlockRepository.findOne({ 
          where: {id},
          relations: {corpus: true}
        });
    
        if(!corpusBlock) throw new NotFoundException("Corpus block not found with ID: " + id);
    
        return corpusBlock;
  }

  async update(id: string, updateCorpusBlockDto: UpdateCorpusBlockDto) {
    const corpusBlock = await this.corpusBlockRepository.findOne({where: {id}});
    if(!corpusBlock) throw new NotFoundException("Corpus block not found with id", id);

    let anyChanges: boolean = false;
    const { status } = updateCorpusBlockDto;
    if(status){
      corpusBlock.status = status;
      console.log("New status for corpus block: ", status);
      anyChanges = true;
    }

    if(anyChanges){
      console.log("Saved changes for corpus block");
      await this.corpusBlockRepository.save(corpusBlock);
    }

  }

  remove(id: number) {
    return `This action removes a #${id} corpusBlock`;
  }
}
