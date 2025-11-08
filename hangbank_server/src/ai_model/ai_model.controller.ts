import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AiModelService } from './ai_model.service';
import { CreateAiModelDto } from './dto/create-ai_model.dto';
import { UpdateAiModelDto } from './dto/update-ai_model.dto';

@Controller('ai-model')
export class AiModelController {
  constructor(private readonly aiModelService: AiModelService) {}

  @Post()
  create(@Body() createAiModelDto: CreateAiModelDto) {
    return this.aiModelService.create(createAiModelDto);
  }

  @Get()
  findAll() {
    return this.aiModelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiModelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAiModelDto: UpdateAiModelDto) {
    return this.aiModelService.update(+id, updateAiModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiModelService.remove(+id);
  }
}
