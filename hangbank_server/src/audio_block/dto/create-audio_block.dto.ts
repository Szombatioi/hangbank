export class CreateAudioBlockDto {
    datasetId: string;
    speakerId: number;
    corpusBlockId?: string; //Nullable because of mode 2 and 3
    transcript?: string; //Nullable because of mode 2 and 3
}
