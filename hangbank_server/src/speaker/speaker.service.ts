import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Speaker } from './entities/speaker.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SpeakerService {

  constructor(
    @InjectRepository(Speaker) private readonly speakerRepository: Repository<Speaker>
  ){}

  create(createSpeakerDto: CreateSpeakerDto) {
    return 'This action adds a new speaker';
  }

  findAll() {
    return `This action returns all speaker`;
  }

  async findOneById(id: number) {
    const speaker = await this.speakerRepository.findOne({ 
      where: {id},
      relations: {user: true, microphone: true}
    });

    if(!speaker) throw new NotFoundException("Speaker not found with ID: " + id);

    return speaker;
  }

  update(id: number, updateSpeakerDto: UpdateSpeakerDto) {
    return `This action updates a #${id} speaker`;
  }

  remove(id: number) {
    return `This action removes a #${id} speaker`;
  }
}
