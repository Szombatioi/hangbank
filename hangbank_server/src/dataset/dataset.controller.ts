import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';

@Controller('dataset')
export class DatasetController {
  constructor(private readonly datasetService: DatasetService) {}

  @Post()
  create(@Body() createDatasetDto: CreateDatasetDto) {
    console.log("Called dataset post");
    return this.datasetService.create(createDatasetDto);
  }

  @Get()
  findAll() {
    return this.datasetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.datasetService.findOne(id);
  }

  @Get('user/:id')
  async findForUser(@Param('id') id: string){
    return this.datasetService.findForUser(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDatasetDto: UpdateDatasetDto) {
    return this.datasetService.update(+id, updateDatasetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.datasetService.remove(+id);
  }
}
