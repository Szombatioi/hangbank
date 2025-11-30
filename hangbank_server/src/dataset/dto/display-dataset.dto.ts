export interface DatasetDisplay{
    title: string;
    corpusName?: string | null;
    language: string;
    actualBlocks?: number | null;
    maxBlocks?: number | null;
    speakerName: string; 
}