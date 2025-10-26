import { Module } from '@nestjs/common';
import { MicrophoneService } from './microphone.service';
import { MicrophoneController } from './microphone.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Microphone } from './entities/microphone.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Microphone])
  ],
  controllers: [MicrophoneController],
  providers: [MicrophoneService],
  exports: [MicrophoneService]
})
export class MicrophoneModule {}
