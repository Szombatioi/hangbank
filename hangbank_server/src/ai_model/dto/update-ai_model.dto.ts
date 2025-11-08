import { PartialType } from '@nestjs/mapped-types';
import { CreateAiModelDto } from './create-ai_model.dto';

export class UpdateAiModelDto extends PartialType(CreateAiModelDto) {}
