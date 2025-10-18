import { PartialType } from '@nestjs/mapped-types';
import { CreateCorpusDto } from './create-corpus.dto';

export class UpdateCorpusDto extends PartialType(CreateCorpusDto) {}
