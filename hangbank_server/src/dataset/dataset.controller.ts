import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { JwtAuthGuard } from 'src/jwt-auth.guard';

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
    return this.datasetService.update(id, updateDatasetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req, @Param('id') id: string) {
    return this.datasetService.remove(req.user, id);
  }

  @Get('download/:id')
  @UseGuards(JwtAuthGuard)
  async download(@Req() req, @Param('id') id: string){
    return this.datasetService.downloadDataset(req.user, id);
  }

}
