import { Injectable } from '@nestjs/common';
import { CreateAudioBlockDto } from './dto/create-audio_block.dto';
import { UpdateAudioBlockDto } from './dto/update-audio_block.dto';

@Injectable()
export class AudioBlockService {
  create(createAudioBlockDto: CreateAudioBlockDto) {
    return 'This action adds a new audioBlock';
  }

  findAll() {
    return `This action returns all audioBlock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} audioBlock`;
  }

  update(id: number, updateAudioBlockDto: UpdateAudioBlockDto) {
    return `This action updates a #${id} audioBlock`;
  }

  remove(id: number) {
    return `This action removes a #${id} audioBlock`;
  }
}
