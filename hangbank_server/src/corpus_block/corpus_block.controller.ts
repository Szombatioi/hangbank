import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CorpusBlockService } from './corpus_block.service';
import { CreateCorpusBlockDto } from './dto/create-corpus_block.dto';
import { UpdateCorpusBlockDto } from './dto/update-corpus_block.dto';

@Controller('corpus-block')
export class CorpusBlockController {
  constructor(private readonly corpusBlockService: CorpusBlockService) {}

  @Post()
  create(@Body() createCorpusBlockDto: CreateCorpusBlockDto) {
    // return this.corpusBlockService.create();
  }

  @Get()
  findAll() {
    return this.corpusBlockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.corpusBlockService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCorpusBlockDto: UpdateCorpusBlockDto) {
    return this.corpusBlockService.update(+id, updateCorpusBlockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.corpusBlockService.remove(+id);
  }
}
