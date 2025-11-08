import { PartialType } from '@nestjs/mapped-types';
import { CreateAiChatHistoryDto } from './create-ai_chat_history.dto';

export class UpdateAiChatHistoryDto extends PartialType(CreateAiChatHistoryDto) {}
