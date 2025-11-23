import { RecordingMode } from "../entities/dataset.entity";

export class CreateDatasetDto {
    projectName: string;
    creator_id: string;
    mode: RecordingMode;
    language: string;

    //---Metadata---
    recording_context?: string;
    speakers: {id: string, mic_deviceId: string, mic_label: string, samplingFrequency: number, speechDialect?: string}[]; //only IDs + mic info
    //---Corpus---
    corpus_id?: string;
    aiModel_id?: string;
}
