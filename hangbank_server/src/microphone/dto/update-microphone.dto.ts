import { PartialType } from '@nestjs/mapped-types';
import { CreateMicrophoneDto } from './create-microphone.dto';

export class UpdateMicrophoneDto extends PartialType(CreateMicrophoneDto) {}
