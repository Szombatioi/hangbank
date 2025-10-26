export class CreateDatasetDto {
    projectName: string;
    creator_id: string;

    //---Metadata---
    recording_context?: string;
    speakers: {id: string, mic_deviceId: string, mic_label: string}[]; //only IDs + mic info
    
    //---Corpus---
    corpus_id: string;
}
