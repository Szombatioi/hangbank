export class CreateDatasetDto {
    projectName: string;
    creator_id: string;

    //---Metadata---
    microphone: string;
    recording_context?: string;
    speaker_ids: string[]; //only IDs
    
    //---Corpus---
    corpus_id: string;
}
