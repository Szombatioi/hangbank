import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { AiModel } from 'src/ai_model/entities/ai_model.entity';
import { AiChatHistory } from 'src/ai_chat_history/entities/ai_chat_history.entity';

@Injectable()
export class AudioBlockService {
  constructor(
    @InjectRepository(AudioBlock)
    private readonly audioBlockRepository: Repository<AudioBlock>,
    @InjectRepository(AiModel)
    private readonly aiModelRepository: Repository<AiModel>,
    @InjectRepository(AiChatHistory)
    private readonly aiChatHistoryRepository: Repository<AiChatHistory>,
    @Inject() private readonly datasetService: DatasetService,
    @Inject() private readonly speakerService: SpeakerService,
    @Inject() private readonly minioService: MinioService,
    @Inject() private readonly corpusBlockService: CorpusBlockService,
  ) {}

  async create(
    createAudioBlockDto: CreateAudioBlockDto,
    audioBlob: Express.Multer.File | null,
  ) {
    try {
      const { datasetId, speakerId, corpusBlockId, transcript, chatHistory, selectedTopic } =
        createAudioBlockDto;
      const chatHistoryObj = JSON.parse(chatHistory);
      if (corpusBlockId && !audioBlob)
        throw new NotFoundException(
          'AudioBlob is required for this kind of save!',
        );
      //Get dataset - throws error if not found
      const dataset = await this.datasetService.findOne(datasetId);

      const speaker = await this.speakerService.findOneById(speakerId);

      //Check if corpusblock is provided
      if (corpusBlockId) {
        const corpusBlock =
          await this.corpusBlockService.findOneById(corpusBlockId);
        //Upload to MinIO
        const result = await this.minioService.uploadObject(
          audioBlob!,
          'audio',
        );

        const audioBlock = await this.audioBlockRepository.save(
          await this.audioBlockRepository.create({
            speaker: speaker,
            dataset: dataset,
            audio_minio_link: result.url,
          }),
        );
        //We expect a transcript for a corpus block!
        if (!transcript) {
          //TODO: add to warnings list of this audioBlock
        }

        //check if the corpusBlock has an audioblock already! (delete it from MinIO)
        const cbAudio = await this.audioBlockRepository.find({
          relations: {
            dataset: true,
            corpusBlock: true,
          },
          where: {
            dataset: { id: dataset.id }, // Ensure the dataset is matched by its ID
            corpusBlock: Not(IsNull()),
          },
        });

        // console.log(cbAudio);

        if (cbAudio.length > 0) {
          cbAudio.forEach((a) => {
            console.log(`$Audio will get deleted`);
            console.log(a);
            this.minioService.deleteObject(a.audio_minio_link, 'audio');
          });
          await this.audioBlockRepository.delete(cbAudio.map((a) => a.id));
        }

        audioBlock.corpusBlock = corpusBlock;

        await this.audioBlockRepository.save(audioBlock);

        //TODO: run checks for the audioBlob
        this.runChecksForBlob(audioBlob!);

        // await this.corpusBlockService.update(corpusBlockId, {status: CorpusBlockStatus.done}); //TODO: handle warnings by checking audio quality!
        //TODO: how should we show error for ai chat quality?
      } else {
        if (audioBlob) {
          //Upload to MinIO
          const result = await this.minioService.uploadObject(
            audioBlob!,
            'audio',
          );

          const audioBlock = await this.audioBlockRepository.save(
            await this.audioBlockRepository.create({
              speaker: speaker,
              dataset: dataset,
              audio_minio_link: result.url,
            }),
          );
          await this.audioBlockRepository.save(audioBlock);
        }

        if (!chatHistoryObj)
          throw new NotFoundException('ChatHistory was not provided!');

        //Save chat history
        const aiModel = await this.aiModelRepository.findOne({
          where: { modelName: chatHistoryObj.aiModelName },
        });
        if (!aiModel)
          throw new NotFoundException(
            'AI model not found with ID: ',
            chatHistoryObj.aiModelName,
          );

        await this.aiChatHistoryRepository.save(
          await this.aiChatHistoryRepository.create({
            aiModel: aiModel,
            dataset: dataset,
            aiSent: chatHistoryObj.aiSent,
            createdAt: chatHistoryObj.createdAt,
            history: chatHistoryObj.text,
          }),
        );

        if(selectedTopic)
          await this.datasetService.update(dataset.id, {selectedTopic})
      }
    } catch (e) {
      throw e;
    }
  }

  //This method checks for the quelity of the recorded blob
  //1. Noise level (Jel/Zaj viszony)
  //2. Loudness/Quiteness
  //etc.
  private async runChecksForBlob(audioBlob: Express.Multer.File) {}

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
