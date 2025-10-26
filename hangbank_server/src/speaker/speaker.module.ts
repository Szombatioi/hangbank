import { Module } from '@nestjs/common';
import { SpeakerService } from './speaker.service';
import { SpeakerController } from './speaker.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Speaker } from './entities/speaker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Speaker])],
  controllers: [SpeakerController],
  providers: [SpeakerService],
  exports: [SpeakerService]
})
export class SpeakerModule {}
