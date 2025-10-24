export class CreateDatasetDto {
    projectName: string;

    //---Metadata---
    microphone: string;
    recording_context?: string;
    speaker_ids: string[]; //only IDs
    
    //---Corpus---
    corpus_id: string;
}
