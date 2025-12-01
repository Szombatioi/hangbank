import archiver from 'archiver';
import { PassThrough, Readable } from 'stream';
import { v4 as uuid } from 'uuid';

import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dataset, RecordingMode } from './entities/dataset.entity';
import { Repository } from 'typeorm';
import { Metadata } from 'src/metadata/entities/metadata.entity';
import { CorpusService } from 'src/corpus/corpus.service';
import { UserService } from 'src/user/user.service';
import { DatasetDisplay } from './dto/display-dataset.dto';
import { MicrophoneService } from 'src/microphone/microphone.service';
import { Speaker } from 'src/speaker/entities/speaker.entity';
import { Microphone } from 'src/microphone/entities/microphone.entity';
import { sample } from 'rxjs';
import {
  CorpusBlock,
  CorpusBlockStatus,
} from 'src/corpus_block/entities/corpus_block.entity';
import { AiChatHistoryService } from 'src/ai_chat_history/ai_chat_history.service';
import { LanguageService } from 'src/language/language.service';
import { AiChatHistory } from 'src/ai_chat_history/entities/ai_chat_history.entity';
import { AiModel } from 'src/ai_model/entities/ai_model.entity';
import { UserAuthDto } from 'src/user/dto/user-auth-dto';
import { AudioBlockService } from 'src/audio_block/audio_block.service';
import { AiChatService } from 'src/ai-chat/ai-chat.service';
import { AiChat } from 'src/ai-chat/entities/ai-chat.entity';
import { MinioService } from 'src/minio/minio.service';

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
    @InjectRepository(AiChatHistory)
    private readonly aiChatHistoryRepository: Repository<AiChatHistory>,
    @InjectRepository(AiModel)
    private readonly aiModelRepository: Repository<AiModel>,
    @Inject() private readonly languageService: LanguageService,
    @Inject() private readonly audioBlockService: AudioBlockService,
    // @Inject() private readonly aiChatService: AiChatService,
    @InjectRepository(AiChat)
    private readonly aiChatRepository: Repository<AiChat>,
    @Inject()
    private readonly minioService: MinioService,
  ) {}

  //Creates a new project with these details:
  //Dataset
  //Metadata
  //Empty audio blocks
  async create(createDatasetDto: CreateDatasetDto) {
    const {
      projectName,
      recording_context,
      corpus_id,
      speakers,
      creator_id,
      mode,
      language,
      aiModel_id,
    } = createDatasetDto;

    console.log(mode);
    if (mode === RecordingMode.Corpus && !corpus_id) {
      throw new NotFoundException('Corpus ID not provided!');
    }

    //Find creator
    const creator = await this.userService.findOneById(creator_id);
    if (!creator)
      throw new NotFoundException('User not found with ID: ' + creator_id);

    if (corpus_id) {
      // Find corpus
      const corpus = await this.corpusService.findOne(corpus_id);
      if (!corpus)
        throw new NotFoundException('Corpus not found with ID: ' + corpus_id);

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

      const metadata = await this.metadataRepository.save(
        await this.metadataRepository.create({
          recording_context,
          language: corpus.language,
          dataset,
        }),
      );

      // Find speakers
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
            currentAge: this.calculateAge(speaker.birthdate),
          });
        }),
      );

      this.speakerRepository.save(speaker_entities);
      return dataset;
    } else {
      //CONVO ------------------------------------------------------------

      if (!aiModel_id)
        throw new BadRequestException('Ai model ID is not provided!');
      const dataset = this.datasetRepository.create({
        name: projectName,
        mode: mode,
        creator: creator,
      });
      await this.datasetRepository.save(dataset);

      const metadata = await this.metadataRepository.save(
        await this.metadataRepository.create({
          recording_context,
          language: language,
          dataset,
        }),
      );
      const speaker = await this.userService.findOneById(creator_id);
      if (!speaker)
        //TODO this is wrong since the service returns an exception if not found
        throw new NotFoundException('User not found with ID: ' + creator_id);

      let mic: Microphone;
      try {
        mic = await this.micService.findOne(speakers[0].mic_deviceId);
      } catch (err) {
        //NotFound
        mic = await this.micService.create(
          speakers[0].mic_deviceId,
          speakers[0].mic_label,
        );
      }

      await this.speakerRepository.save(
        await this.speakerRepository.create({
          user: speaker,
          microphone: mic,
          metadata: metadata,
          samplingFrequency: speakers[0].samplingFrequency,
          speechDialect: speakers[0].speechDialect,
          currentAge: this.calculateAge(speaker.birthdate),
        }),
      );

      const aiModel = await this.aiModelRepository.findOne({
        where: { name: aiModel_id },
      });
      if (!aiModel)
        throw new NotFoundException(
          'AiModel not found with name: ',
          aiModel_id,
        );

      await this.datasetRepository.save(dataset);
      // dataset.aiChat = await this.aiChatService.create({datasetId: dataset.id, aiModelId: aiModel_id});
      dataset.aiChat = await this.aiChatRepository.save(
        await this.aiChatRepository.create({
          // topic: null, //Initially this is null
          aiModel: aiModel,
          aiChatHistory: [],
          dataset: dataset,
        }),
      );

      return dataset;
    }
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
        audioBlocks: { corpusBlock: true },
        metadata: { speakers: true },
      },
    });

    const datasetDisplays: DatasetDisplay[] = datasets.map((dataset) => {
      // console.log(dataset.metadata?.speakers);
      return {
        id: dataset.id,
        title: dataset.name,
        corpusName:
          dataset.mode === RecordingMode.Corpus ? dataset.corpus.name : null,
        language: dataset.metadata.language,
        actualBlocks:
          dataset.mode === RecordingMode.Corpus
            ? dataset.audioBlocks.filter((a) => a.corpusBlock !== null).length
            : null,
        maxBlocks:
          dataset.mode === RecordingMode.Corpus
            ? dataset.corpus.corpus_blocks.length
            : null,
        speakerName:
          dataset.metadata?.speakers?.map((s) => s.user.name).join(',') ?? '',
        type: dataset.mode,
      };
    });
    return datasetDisplays;
  }

  async findOne(id: string) {
    const dataset = await this.datasetRepository.findOne({
      where: { id },
      relations: {
        corpus: { corpus_blocks: true },
        audioBlocks: { corpusBlock: true, dataset: true },
        metadata: { speakers: { user: true, microphone: true } },
        aiChat: {
          aiModel: true,
          aiChatHistory: true,
        },
      },
    });
    if (!dataset)
      throw new NotFoundException('Dataset not found with ID: ' + id);

    // console.log(dataset.metadata.speakers);

    //TODO: maybe this format is not good everywhere, it was intended to return to Project Overview page

    if (dataset.mode === RecordingMode.Corpus) {
      return {
        id: dataset.id,
        projectTitle: dataset.name,
        language: dataset.metadata.language,
        speakers: dataset.metadata.speakers.map((s) => {
          return {
            id: s.id,
            user: { id: s.user.id, name: s.user.name },
            mic: {
              deviceId: s.microphone.deviceId,
              deviceLabel: s.microphone.label,
            },
            samplingFrequency: s.samplingFrequency,
            speechDialect: s.speechDialect,
          };
        }),
        corpus: dataset.corpus && {
          id: dataset.corpus.id,
          name: dataset.corpus.name,
        },
        context: dataset.metadata.recording_context,
        aiChat: {
          id: dataset.aiChat?.id,
          aiModel: {
            modelName: dataset.aiChat?.aiModel.modelName,
            name: dataset.aiChat?.aiModel.name,
          },
          aiChatHistory: dataset.aiChat?.aiChatHistory.map((ch) => ({
            id: ch.id,
            aiSent: ch.aiSent,
            history: ch.history,
          })),
        },
        corpusBlocks:
          dataset.corpus &&
          dataset.corpus.corpus_blocks
            .sort((a, b) => a.sequence - b.sequence)
            .map((cb) => {
              const audioBlock = dataset.audioBlocks.find((ab) => {
                return (
                  ab.corpusBlock.id === cb.id && ab.dataset.id === dataset.id
                );
              });
              // console.log("Dataset: ",dataset.id)
              // console.log(cb.id)
              return {
                id: cb.id,
                sequence: cb.sequence,
                filename: cb.filename,
                status:
                  audioBlock != null
                    ? cb.status === CorpusBlockStatus.warning
                      ? CorpusBlockStatus.warning
                      : CorpusBlockStatus.done
                    : CorpusBlockStatus.todo,
              };
            }),
      };
    } else {
      const language = await this.languageService.findOneByCode(
        dataset.metadata.language,
      );
      const chatHistory = (
        await this.aiChatHistoryRepository.find({
          where: { aiChat: { id: dataset!.aiChat!.id } },
        })
      ).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      console.log('Dataset aichat: ', dataset.aiChat);
      console.log('ChatHistory: ', chatHistory);

      return {
        id: dataset.id,
        projectTitle: dataset.name,
        speakers: [
          {
            id: dataset.metadata.speakers[0].id,
            user: {
              id: dataset.metadata.speakers[0].user.id,
              name: dataset.metadata.speakers[0].user.name,
            },
            mic: {
              deviceId: dataset.metadata.speakers[0].microphone.deviceId,
              deviceLabel: dataset.metadata.speakers[0].microphone.label,
            },
            samplingFrequency: dataset.metadata.speakers[0].samplingFrequency,
            speechDialect: dataset.metadata.speakers[0].speechDialect,
          },
        ],
        context: dataset.metadata.recording_context,
        speechDialect: dataset.metadata.speakers[0].speechDialect,
        aiChat: {
          aiChatHistory: chatHistory.map((c) => ({
            id: c.id,
            text: c.history,
            aiSent: c.aiSent,
            createdAt: c.createdAt,
          })),
          aiModel: {
            modelName: dataset.aiChat?.aiModel.modelName,
            name: dataset.aiChat?.aiModel.name,
          },
          topic: dataset.aiChat?.topic,
          id: dataset.aiChat?.id,
        },

        language: {
          code: language.code,
          name: language.name,
        },
      };
    }
  }

  async update(id: string, updateDatasetDto: UpdateDatasetDto) {
    const { selectedTopic } = updateDatasetDto;
    const dataset = await this.datasetRepository.findOne({
      where: { id },
      relations: { metadata: true, aiChat: true },
    });
    if (!dataset)
      throw new NotFoundException('Dataset not found with ID: ', id);

    if (dataset.mode === RecordingMode.Conversation) {
      console.log('Mode is CONVO');
      if (selectedTopic) {
        console.log('Topic is selected');
        dataset.aiChat!.topic = selectedTopic; //In this case, aiChat MUST be present
      }
    }

    await this.datasetRepository.save(dataset);
  }

  async remove(auth: UserAuthDto, id: string) {
    const { userId } = auth;
    const user = await this.userService.findOneById(userId);
    const dataset = await this.datasetRepository.findOne({
      where: { id },
      relations: { creator: true, audioBlocks: true, aiChat: true },
    });
    if (!dataset)
      throw new NotFoundException('Dataset not found with ID: ', id);
    if (dataset.creator.id !== user.id)
      throw new UnauthorizedException(
        'You have no right to delete this dataset!',
      );

    //Remove: Dataset + AudioBlocks + ChatHistory if exists
    await dataset.audioBlocks.forEach(
      async (a) => await this.audioBlockService.remove(a.id),
    );
    if (dataset.mode === RecordingMode.Conversation) {
      const chatHistory = await this.aiChatHistoryRepository.find({
        where: { aiChat: { id: dataset.aiChat!.id } },
      });
      console.log('ChatHistory: ', chatHistory);
      chatHistory.forEach(async (ch) => {
        await this.aiChatHistoryRepository.delete(ch);
      });
    }
    this.datasetRepository.remove(dataset);
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

  async downloadDataset(userAuth: UserAuthDto, datasetId: string) {
    const { userId } = userAuth;
    const user = await this.userService.findOneById(userId); //We need to find the user, because what if they do not exist?
    const dataset = await this.datasetRepository.findOne({
      where: { id: datasetId },
      relations: { creator: true, audioBlocks: { corpusBlock: true }, aiChat: {aiChatHistory: true} },
    });
    if (!dataset)
      throw new NotFoundException('Dataset not found with ID: ', datasetId);

    if (dataset.creator.id !== user.id)
      throw new UnauthorizedException(
        'You have no right to download this dataset!',
      );

    //ZIP
    const archiveStream = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(archiveStream);

    const metadataLines: string[] = [];

    let fileIndex = 1;

      for (const ab of dataset.audioBlocks) {
        const audioLink = ab.audio_minio_link.split("/");
        const audioObjName = audioLink[audioLink.length - 1];
        

        //Download from MinIO
        const audio = await this.minioService.downloadObject(
          audioObjName,
          'audio',
        ); //This is a .wav file

        const audioBuffer = await streamToBuffer(audio);


        //Add to zip
        const filename = fileIndex.toString().padStart(4, '0'); // 0001.wav
        archive.append(audioBuffer, { name: `dataset/audio/${filename}.wav` });

        fileIndex++;
      };

    if (dataset.mode === RecordingMode.Corpus) {
      fileIndex = 1;
      for(const ab of dataset.audioBlocks){
        const cblockLink = ab.corpusBlock.corpus_block_minio_link.split("/");
        const cblockObjName = cblockLink[cblockLink.length - 1];

        const text = await this.minioService.downloadObject(
          cblockObjName,
          'corpus-blocks',
        ); //This is a .txt file

        const transcript = (await streamToString(text)).trim();

        //Add to metadata.cs
        const filename = fileIndex.toString().padStart(4, '0'); // 0001.wav
        metadataLines.push(`audio/${filename}.wav|${transcript}`);

        fileIndex++;
      }
    } else { //Convo
      fileIndex = 1;
      for(const ch of dataset.aiChat!.aiChatHistory){
        if(ch.aiSent) continue;
        const transcript = ch.history.trim();

        //Add to metadata.cs
        const filename = fileIndex.toString().padStart(4, '0'); // 0001.wav
        metadataLines.push(`audio/${filename}.wav|${transcript}`);

        fileIndex++;
      }
    }

    //Add metadata to the ZIP
    archive.append(metadataLines.join("\n"), { name: "dataset/metadata.csv" });
    await archive.finalize();
    return new StreamableFile(archiveStream, {
      disposition: `attachment; filename="${dataset.name}.zip"`
    });
  }
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

async function streamToString(stream: Readable): Promise<string> {
  const buffer = await streamToBuffer(stream);
  return buffer.toString("utf8");
}