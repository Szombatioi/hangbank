import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAudioBlockDto } from './dto/create-audio_block.dto';
import { UpdateAudioBlockDto } from './dto/update-audio_block.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { AudioBlock } from './entities/audio_block.entity';
import { DatasetService } from 'src/dataset/dataset.service';
import { SpeakerService } from 'src/speaker/speaker.service';
import { MinioService } from 'src/minio/minio.service';
import { CorpusBlockService } from 'src/corpus_block/corpus_block.service';
import {
  CorpusBlock,
  CorpusBlockStatus,
} from 'src/corpus_block/entities/corpus_block.entity';
import { AiModel } from 'src/ai_model/entities/ai_model.entity';
import { AiChatHistory } from 'src/ai_chat_history/entities/ai_chat_history.entity';
import {
  checkAudioQuality,
  QualityMeasure,
} from 'src/modules/audio-quality-checker';
import { Dataset } from 'src/dataset/entities/dataset.entity';
import { AiChatService } from 'src/ai-chat/ai-chat.service';

@Injectable()
export class AudioBlockService {
  constructor(
    @InjectRepository(AudioBlock)
    private readonly audioBlockRepository: Repository<AudioBlock>,
    @InjectRepository(AiModel)
    private readonly aiModelRepository: Repository<AiModel>,
    @InjectRepository(AiChatHistory)
    private readonly aiChatHistoryRepository: Repository<AiChatHistory>,
    @Inject(forwardRef(() => DatasetService))
    private readonly datasetService: DatasetService,
    @Inject() private readonly speakerService: SpeakerService,
    @Inject() private readonly minioService: MinioService,
    @Inject() private readonly corpusBlockService: CorpusBlockService,
    @Inject() private readonly aiChatService: AiChatService,
    @InjectRepository(Dataset)
    private readonly datasetRepository: Repository<Dataset>,
  ) {}

  async create(
    createAudioBlockDto: CreateAudioBlockDto,
    audioBlob: Express.Multer.File | null,
  ) {
    try {
      // 1. Kiszedjük a mezőket
      const {
        datasetId,
        speakerId,
        corpusBlockId,
        transcript,
        chatHistory,
        selectedTopic,
      } = createAudioBlockDto;

      if (corpusBlockId && !audioBlob) {
        throw new NotFoundException(
          'AudioBlob is required for this kind of save!',
        );
      }

      const dataset = await this.datasetRepository.findOne({
        where: { id: datasetId },
        relations: {corpus: { corpus_blocks: true },
        audioBlocks: { corpusBlock: true, dataset: true },
        metadata: { speakers: { user: true, microphone: true } },
        aiChat: {
          aiModel: true,
          aiChatHistory: true
        },}
      });

      if (!dataset) throw new NotFoundException("Dataset not found");
      const speaker = await this.speakerService.findOneById(speakerId);

      //Check if corpusblock is provided
      if (corpusBlockId) {
        console.log('CospusBlockId: ', corpusBlockId);
        const corpusBlock =
          await this.corpusBlockService.findOneById(corpusBlockId);
        console.log('CospusBlock: ', corpusBlock);
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
            // corpusBlock: corpusBlock //Saving corpusBlock too
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
            corpusBlock: { id: corpusBlockId }, //Fixed: not checkint Not(IsNull()) for cb, since it will delete all...
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

        //run checks for the audioBlob -> do it for Convo type too!
        this.runChecksForBlob(audioBlob!, corpusBlock);

        // await this.corpusBlockService.update(corpusBlockId, {status: CorpusBlockStatus.done}); //TODO: handle warnings by checking audio quality!
        //TODO: how should we show error for ai chat quality?
      } else {
        if (!chatHistory)
          throw new NotFoundException('ChatHistory was not provided!');

        // 2. BIZTOSÍTÉK: Manuális parse-olás, ha stringként jött
        let chatHistoryObj: any = chatHistory;
        if (typeof chatHistory === 'string') {
          try {
            chatHistoryObj = JSON.parse(chatHistory);
          } catch (e) {
            console.error('JSON Parse error', e);
            throw new BadRequestException('Invalid ChatHistory format');
          }
        }

        console.log('ChatHistory sent by AI? ', chatHistoryObj.aiSent);

        // 3. Most már a chatHistoryObj-t használjuk az ellenőrzéshez!
        if (chatHistoryObj.aiSent === false && !audioBlob) {
          // Fontos: a === false ellenőrzés jobb, mint a !chatHistoryObj.aiSent,
          // mert ha undefined, akkor is igaz lenne a !jel
          return new BadRequestException(
            'Audio not provided for user message!',
          );
        }

        if (audioBlob) {
          const result = await this.minioService.uploadObject(
            audioBlob!,
            'audio',
          );
          const audioBlock = await this.audioBlockRepository.create({
            speaker: speaker,
            dataset: dataset,
            audio_minio_link: result.url,
          });
          await this.audioBlockRepository.save(audioBlock);
        }

        const aiChat = await this.aiChatService.findOne(dataset!.aiChat!.id!);

        // 4. Mentésnél is a chatHistoryObj változót használjuk!
        await this.aiChatHistoryRepository.save(
          this.aiChatHistoryRepository.create({
            aiChat: aiChat,
            aiSent: chatHistoryObj.aiSent,
            createdAt: chatHistoryObj.createdAt,
            history: chatHistoryObj.text,
          }),
        );

        if (selectedTopic)
          await this.datasetService.update(dataset.id, { selectedTopic });
      }
    } catch (e) {
      throw e;
    }
  }

  //This method checks for the quality of the recorded blob
  //1. Noise level (Jel/Zaj viszony)
  //2. Loudness/Quiteness
  //etc.
  private async runChecksForBlob(
    audioBlob: Express.Multer.File,
    corpusBlock: CorpusBlock,
  ) {
    const quality: QualityMeasure = checkAudioQuality(audioBlob!);
    if (quality.tooLoud || quality.tooNoisy || quality.tooQuiet) {
      corpusBlock.status = CorpusBlockStatus.warning;
      //TODO: save the error as an entity
      this.corpusBlockService.update(corpusBlock.id, {
        status: corpusBlock.status,
      });
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

  async remove(id: string) {
    const audioBlock = await this.audioBlockRepository.findOne({
      where: { id },
    });
    if (!audioBlock) throw new NotFoundException('AudioBlock not found');

    this.minioService.deleteObject(audioBlock.audio_minio_link, 'audio');
    this.audioBlockRepository.remove(audioBlock);
  }
}
