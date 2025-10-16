import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AudioBlockService } from './audio_block.service';
import { CreateAudioBlockDto } from './dto/create-audio_block.dto';
import { UpdateAudioBlockDto } from './dto/update-audio_block.dto';

@Controller('audio-block')
export class AudioBlockController {
  constructor(private readonly audioBlockService: AudioBlockService) {}

  @Post()
  create(@Body() createAudioBlockDto: CreateAudioBlockDto) {
    return this.audioBlockService.create(createAudioBlockDto);
  }

  @Get()
  findAll() {
    return this.audioBlockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.audioBlockService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAudioBlockDto: UpdateAudioBlockDto) {
    return this.audioBlockService.update(+id, updateAudioBlockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.audioBlockService.remove(+id);
  }
}
