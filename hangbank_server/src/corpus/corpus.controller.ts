import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CorpusService } from './corpus.service';
import { CreateCorpusDto } from './dto/create-corpus.dto';
import { UpdateCorpusDto } from './dto/update-corpus.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('corpus')
export class CorpusController {
  constructor(private readonly corpusService: CorpusService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() dto: CreateCorpusDto, @UploadedFile() file: Express.Multer.File) {
;    return this.corpusService.create(dto, file);
  }

  @Get()
  findAll() {
    return this.corpusService.findAll();
  }

  @Get(':id/blocks')
  async findBlocks(@Param('id') id: string){
    return await this.corpusService.findBlocks(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.corpusService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCorpusDto: UpdateCorpusDto) {
    return this.corpusService.update(+id, updateCorpusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.corpusService.remove(+id);
  }
}
