import { PartialType } from '@nestjs/mapped-types';
import { CreateAudioBlockDto } from './create-audio_block.dto';

export class UpdateAudioBlockDto extends PartialType(CreateAudioBlockDto) {}
