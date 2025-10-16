import { Module } from '@nestjs/common';
import { AudioBlockService } from './audio_block.service';
import { AudioBlockController } from './audio_block.controller';

@Module({
  controllers: [AudioBlockController],
  providers: [AudioBlockService],
})
export class AudioBlockModule {}
