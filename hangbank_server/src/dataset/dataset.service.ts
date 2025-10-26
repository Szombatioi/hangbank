import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dataset } from './entities/dataset.entity';
import { Repository } from 'typeorm';
import { Metadata } from 'src/metadata/entities/metadata.entity';
import { CorpusService } from 'src/corpus/corpus.service';
import { UserService } from 'src/user/user.service';
import { DatasetDisplay } from './dto/display-dataset.dto';

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
      creator_id
    } = createDatasetDto;
  
    // Find corpus
    console.log("Find corpus");
    const corpus = await this.corpusService.findOne(corpus_id);
    if (!corpus)
      throw new NotFoundException('Corpus not found with ID: ' + corpus_id);
  
    // Find speakers
    console.log("Find speakers");
    const speakers = await Promise.all(
      speaker_ids.map(async (id) => {
        const speaker = await this.userService.findOneById(id);
        if (!speaker)
          throw new NotFoundException('User not found with ID: ' + id);
        return speaker;
      }),
    );

    //Find creator
    const creator = await this.userService.findOneById(creator_id);
    if(!creator) throw new NotFoundException('User not found with ID: ' + creator_id);
  
    console.log("Creating dataset");
    // Step 1: Create and save dataset
    const dataset = this.datasetRepository.create({
      name: projectName,
      corpus,
      metadata: {
        microphone,
        recording_context,
        speakers,
      },
      creator: creator
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

  async findForUser(id: string): Promise<DatasetDisplay[]>{
    const user = await this.userService.findOneById(id);
    if(!user) throw new NotFoundException("User not found with ID: " + id);
    const datasets = await this.datasetRepository.find({where: {creator: {id: id}}, relations:{
      corpus: {corpus_blocks: true},
      audioBlocks: true,
      metadata: {speakers: true}
    }})

    const datasetDisplays: DatasetDisplay[] = datasets.map((dataset) => {
      console.log(dataset.metadata?.speakers);
      return {
        id: dataset.id,
        title: dataset.name,
        corpusName: dataset.corpus.name,
        language: dataset.corpus.language,
        actualBlocks: dataset.audioBlocks.length,
        maxBlocks: dataset.corpus.corpus_blocks.length,
        speakerName: dataset.metadata?.speakers?.map((s) => s.name).join(",") ?? "",
      };
    });
    return datasetDisplays;
  }

  async findOne(id: string) {
    const dataset = await this.datasetRepository.findOne({where: {id}, relations: {
      corpus: {corpus_blocks: true},
      metadata: {speakers: true}
    }});
    if(!dataset) throw new NotFoundException("Dataset not found with ID: "+id);

    console.log(dataset.metadata.speakers);

    //TODO: maybe this format is not good everywhere, it was intended to return to Project Overview page
    return {
      projectTitle: dataset.name,
      speaker: {
        id: dataset.metadata.speakers[0].id,
        name: dataset.metadata.speakers[0].name
      }, //TODO: array in future?
      mic: dataset.metadata.microphone,
      corpus: {id: dataset.corpus.id, name: dataset.corpus.name},
      context: dataset.metadata.recording_context,
      corpusBlocks: dataset.corpus.corpus_blocks.sort((a, b) => a.sequence - b.sequence).map((cb) =>{
        return {
          id: cb.id,
          sequence: cb.sequence,
          filename: cb.filename,
          status: cb.status,
        };
      })
    };
  }

  update(id: number, updateDatasetDto: UpdateDatasetDto) {
    return `This action updates a #${id} dataset`;
  }

  remove(id: number) {
    return `This action removes a #${id} dataset`;
  }
}
