import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dataset } from './entities/dataset.entity';
import { Repository } from 'typeorm';
import { Metadata } from 'src/metadata/entities/metadata.entity';
import { CorpusService } from 'src/corpus/corpus.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class DatasetService {
  constructor(
    @InjectRepository(Dataset)
    private readonly datasetRepository: Repository<Dataset>,
    @InjectRepository(Metadata)
    private readonly metadataRepository: Repository<Metadata>,
    @Inject() private readonly corpusService: CorpusService,
    @Inject() private readonly userService: UserService,
  ) {}

  //Creates a new project with these details:
  //Dataset
  //Metadata
  //Empty audio blocks
  async create(createDatasetDto: CreateDatasetDto) {
    const {
      projectName,
      microphone,
      recording_context,
      corpus_id,
      speaker_ids,
    } = createDatasetDto;
  
    // Find corpus
    const corpus = await this.corpusService.findOne(corpus_id);
    if (!corpus)
      throw new NotFoundException('Corpus not found with ID: ' + corpus_id);
  
    // Find speakers
    const speakers = await Promise.all(
      speaker_ids.map(async (id) => {
        const speaker = await this.userService.findOneById(id);
        if (!speaker)
          throw new NotFoundException('User not found with ID: ' + id);
        return speaker;
      }),
    );
  
    // Step 1: Create and save dataset
    const dataset = this.datasetRepository.create({
      name: projectName,
      corpus,
      metadata: {
        microphone,
        recording_context,
        speakers,
      },
    });
    await this.datasetRepository.save(dataset);
  
    // Step 2: Create and save metadata
    // const metadata = this.metadataRepository.create({
    //   microphone,
    //   recording_context,
    //   dataset, // dataset already has ID
    //   speakers,
    // });
    // await this.metadataRepository.save(metadata);
  
    // ✅ Do NOT assign dataset.metadata = metadata here
    // It causes the circular update issue
  
    return dataset;
  }
  

  findAll() {
    return `This action returns all dataset`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dataset`;
  }

  update(id: number, updateDatasetDto: UpdateDatasetDto) {
    return `This action updates a #${id} dataset`;
  }

  remove(id: number) {
    return `This action removes a #${id} dataset`;
  }
}
