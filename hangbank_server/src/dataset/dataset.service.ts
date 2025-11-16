import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dataset } from './entities/dataset.entity';
import { Repository } from 'typeorm';
import { Metadata } from 'src/metadata/entities/metadata.entity';
import { CorpusService } from 'src/corpus/corpus.service';
import { UserService } from 'src/user/user.service';
import { DatasetDisplay } from './dto/display-dataset.dto';
import { MicrophoneService } from 'src/microphone/microphone.service';
import { Speaker } from 'src/speaker/entities/speaker.entity';
import { Microphone } from 'src/microphone/entities/microphone.entity';
import { sample } from 'rxjs';
import { CorpusBlockStatus } from 'src/corpus_block/entities/corpus_block.entity';

@Injectable()
export class DatasetService {
  constructor(
    @InjectRepository(Dataset)
    private readonly datasetRepository: Repository<Dataset>,
    @InjectRepository(Metadata)
    private readonly metadataRepository: Repository<Metadata>,
    @Inject() private readonly corpusService: CorpusService,
    @Inject() private readonly userService: UserService,
    @InjectRepository(Speaker)
    private readonly speakerRepository: Repository<Speaker>,
    @Inject() private readonly micService: MicrophoneService,
  ) {}

  //Creates a new project with these details:
  //Dataset
  //Metadata
  //Empty audio blocks
  async create(createDatasetDto: CreateDatasetDto) {
    const { projectName, recording_context, corpus_id, speakers, creator_id, mode } =
      createDatasetDto;

    // Find corpus
    // console.log('Find corpus');
    const corpus = await this.corpusService.findOne(corpus_id);
    if (!corpus)
      throw new NotFoundException('Corpus not found with ID: ' + corpus_id);

    //Find creator
    // console.log('Find creator');
    const creator = await this.userService.findOneById(creator_id);
    if (!creator)
      throw new NotFoundException('User not found with ID: ' + creator_id);

    // console.log('Create dataset');
    const dataset = this.datasetRepository.create({
      name: projectName,
      corpus,
      mode: mode,
      // metadata: {
      //   recording_context,
      //   speakers,
      // },
      creator: creator,
    });
    await this.datasetRepository.save(dataset);

    // console.log('Create metadata');
    const metadata = await this.metadataRepository.save(
      await this.metadataRepository.create({
        recording_context,
        dataset,
      }),
    );

    // Find speakers
    // console.log('Find speakers');
    const speaker_entities: Speaker[] = await Promise.all(
      speakers.map(async (s) => {
        const speaker = await this.userService.findOneById(s.id);
        if (!speaker)
          //TODO this is wrong since the service returns an exception if not found
          throw new NotFoundException('User not found with ID: ' + s.id);

        let mic: Microphone;
        try {
          mic = await this.micService.findOne(s.mic_deviceId);
        } catch (err) {
          //NotFound
          mic = await this.micService.create(s.mic_deviceId, s.mic_label);
        }
        // console.log('Create speaker entity');
        return await this.speakerRepository.create({
          user: speaker,
          microphone: mic,
          metadata: metadata,
          samplingFrequency: s.samplingFrequency,
          speechDialect: s.speechDialect,
          currentAge: this.calculateAge(speaker.birthdate)
        });
      }),
    );

    this.speakerRepository.save(speaker_entities);
    return dataset;
  }

  findAll() {
    return `This action returns all dataset`;
  }

  async findForUser(id: string): Promise<DatasetDisplay[]> {
    const user = await this.userService.findOneById(id);
    if (!user) throw new NotFoundException('User not found with ID: ' + id);
    const datasets = await this.datasetRepository.find({
      where: { creator: { id: id } },
      relations: {
        corpus: { corpus_blocks: true },
        audioBlocks: {corpusBlock: true},
        metadata: { speakers: true },
      },
    });


    const datasetDisplays: DatasetDisplay[] = datasets.map((dataset) => {
      // console.log(dataset.metadata?.speakers);
      return {
        id: dataset.id,
        title: dataset.name,
        corpusName: dataset.corpus.name,
        language: dataset.corpus.language,
        actualBlocks: dataset.audioBlocks.filter(a => a.corpusBlock !== null).length,
        maxBlocks: dataset.corpus.corpus_blocks.length,
        speakerName:
          dataset.metadata?.speakers?.map((s) => s.user.name).join(',') ?? '',
      };
    });
    return datasetDisplays;
  }

  async findOne(id: string) {
    const dataset = await this.datasetRepository.findOne({
      where: { id },
      relations: {
        corpus: { corpus_blocks: true },
        audioBlocks: {corpusBlock: true},
        metadata: { speakers: { user: true, microphone: true } },
      },
    });
    if (!dataset)
      throw new NotFoundException('Dataset not found with ID: ' + id);

    // console.log(dataset.metadata.speakers);

    //TODO: maybe this format is not good everywhere, it was intended to return to Project Overview page
    return {
      id: dataset.id,
      projectTitle: dataset.name,
      language: dataset.corpus.language,
      speakers: dataset.metadata.speakers.map((s) => {
        return {
          id: s.id,
          user: { id: s.user.id, name: s.user.name },
          mic: { deviceId: s.microphone.deviceId, deviceLabel: s.microphone.label },
          samplingFrequency: s.samplingFrequency,
          speechDialect: s.speechDialect
        };
      }),
      corpus: { id: dataset.corpus.id, name: dataset.corpus.name },
      context: dataset.metadata.recording_context,
      corpusBlocks: dataset.corpus.corpus_blocks
        .sort((a, b) => a.sequence - b.sequence)
        .map((cb) => {
          return {
            id: cb.id,
            sequence: cb.sequence,
            filename: cb.filename,
            status: cb.status,
          };
        }),
    };
  }

  update(id: number, updateDatasetDto: UpdateDatasetDto) {
    return `This action updates a #${id} dataset`;
  }

  remove(id: number) {
    return `This action removes a #${id} dataset`;
  }


  private calculateAge(birthdate: Date): number {
    const today = new Date();
    
    let age = today.getFullYear() - birthdate.getFullYear();
    
    const hasHadBirthdayThisYear =
      today.getMonth() > birthdate.getMonth() ||
      (today.getMonth() === birthdate.getMonth() &&
       today.getDate() >= birthdate.getDate());
  
    if (!hasHadBirthdayThisYear) {
      age--;
    }
  
    return age;
  }
}
