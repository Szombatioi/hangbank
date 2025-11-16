import { Inject, Injectable } from '@nestjs/common';
import { CreateAudioBlockDto } from './dto/create-audio_block.dto';
import { UpdateAudioBlockDto } from './dto/update-audio_block.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { AudioBlock } from './entities/audio_block.entity';
import { DatasetService } from 'src/dataset/dataset.service';
import { SpeakerService } from 'src/speaker/speaker.service';
import { MinioService } from 'src/minio/minio.service';
import { CorpusBlockService } from 'src/corpus_block/corpus_block.service';
import { CorpusBlockStatus } from 'src/corpus_block/entities/corpus_block.entity';

@Injectable()
export class AudioBlockService {

  constructor(
    @InjectRepository(AudioBlock) private readonly audioBlockRepository: Repository<AudioBlock>,
    @Inject() private readonly datasetService: DatasetService,
    @Inject() private readonly speakerService: SpeakerService,
    @Inject() private readonly minioService: MinioService,
    @Inject() private readonly corpusBlockService: CorpusBlockService,
  ){}

  async create(createAudioBlockDto: CreateAudioBlockDto, audioBlob: Express.Multer.File) {
    try{
      const {datasetId, speakerId, corpusBlockId} = createAudioBlockDto;
    
    //Get dataset - throws error if not found
    const dataset = await this.datasetService.findOne(datasetId);
    
    const speaker = await this.speakerService.findOneById(speakerId);

      //Upload to MinIO
    const result = await this.minioService.uploadObject(audioBlob, 'audio');

    const audioBlock = await this.audioBlockRepository.save(await this.audioBlockRepository.create({
      speaker: speaker,
      dataset: dataset,
      audio_minio_link: result.url,
    }));

    //Check if corpusblock is provided
    if(corpusBlockId){
      const corpusBlock = await this.corpusBlockService.findOneById(corpusBlockId);

      //check if the corpusBlock has an audioblock already! (delete it from MinIO)
      const cbAudio = await this.audioBlockRepository.find({ where: { corpusBlock: Not(IsNull()) } });
      
      cbAudio.forEach(a => {
        this.minioService.deleteObject(a.audio_minio_link, "audio");
      });
      await this.audioBlockRepository.delete(cbAudio);

      audioBlock.corpusBlock = corpusBlock;

      await this.audioBlockRepository.save(audioBlock);
      await this.corpusBlockService.update(corpusBlockId, {status: CorpusBlockStatus.done}); //TODO: handle warnings by checking audio quality!
    }
    
    } catch(e){
      throw e;
    }
  }

  findAll() {
    return `This action returns all audioBlock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} audioBlock`;
  }

  update(id: number, updateAudioBlockDto: UpdateAudioBlockDto) {
    return `This action updates a #${id} audioBlock`;
  }

  remove(id: number) {
    return `This action removes a #${id} audioBlock`;
  }
}
