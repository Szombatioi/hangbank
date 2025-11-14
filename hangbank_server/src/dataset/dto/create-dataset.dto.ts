import { RecordingMode } from "../entities/dataset.entity";

export class CreateDatasetDto {
    projectName: string;
    creator_id: string;
    mode: RecordingMode;

    //---Metadata---
    recording_context?: string;
    speakers: {id: string, mic_deviceId: string, mic_label: string, samplingFrequency: number}[]; //only IDs + mic info
    //---Corpus---
    corpus_id: string;
}
