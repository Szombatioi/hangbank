import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AudioBlockService } from './audio_block.service';
import { CreateAudioBlockDto } from './dto/create-audio_block.dto';
import { UpdateAudioBlockDto } from './dto/update-audio_block.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('audio-block')
export class AudioBlockController {
  constructor(private readonly audioBlockService: AudioBlockService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: process.env.NODE_ENV === 'development' ? undefined : undefined, // Alapértelmezésben a memóriát használja a NestJS/Multer
    limits: {
        fileSize: 50 * 1024 * 1024, //Max 50Mb
    },
}))
  create(@Body() createAudioBlockDto: CreateAudioBlockDto, @UploadedFile() audioBlob: Express.Multer.File | null) {
    return this.audioBlockService.create(createAudioBlockDto, audioBlob);
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

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.audioBlockService.remove(+id);
  // }
}
