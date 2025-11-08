import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMicrophoneDto } from './dto/create-microphone.dto';
import { UpdateMicrophoneDto } from './dto/update-microphone.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Microphone } from './entities/microphone.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MicrophoneService {
  constructor(@InjectRepository(Microphone) private readonly microphoneRepository: Repository<Microphone>){}

  async create(deviceId: string, deviceLabel: string) {
    return await this.microphoneRepository.save(
      await this.microphoneRepository.create({deviceId: deviceId, label: deviceLabel})
    );
  }

  async findAll() {
    return await this.microphoneRepository.find();
  }

  async findOne(deviceId: string) {
    const mic = await this.microphoneRepository.findOne({where: {deviceId}});
    if(!mic) throw new NotFoundException("Microphone not found with ID: " + deviceId);
    return mic;
  }

  update(id: number, updateMicrophoneDto: UpdateMicrophoneDto) {
    return `This action updates a #${id} microphone`;
  }

  remove(id: number) {
    return `This action removes a #${id} microphone`;
  }
}
