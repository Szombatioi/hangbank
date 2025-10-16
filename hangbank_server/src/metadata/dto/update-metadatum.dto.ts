import { PartialType } from '@nestjs/mapped-types';
import { CreateMetadatumDto } from './create-metadatum.dto';

export class UpdateMetadatumDto extends PartialType(CreateMetadatumDto) {}
