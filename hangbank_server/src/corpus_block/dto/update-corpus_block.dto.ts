import { PartialType } from '@nestjs/mapped-types';
import { CreateCorpusBlockDto } from './create-corpus_block.dto';
import { CorpusBlockStatus } from '../entities/corpus_block.entity';

export class UpdateCorpusBlockDto extends PartialType(CreateCorpusBlockDto) {
    status: CorpusBlockStatus;
}
