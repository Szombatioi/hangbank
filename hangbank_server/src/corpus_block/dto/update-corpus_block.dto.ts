import { PartialType } from '@nestjs/mapped-types';
import { CreateCorpusBlockDto } from './create-corpus_block.dto';

export class UpdateCorpusBlockDto extends PartialType(CreateCorpusBlockDto) {}
