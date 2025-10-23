export default interface CorpusHeaderDto{
    id: string,
    name: string;
    language: string; //HU, EN etc.
    category: string; //e.g. News reading, Storytelling etc. -> but this is not mandatory
    corpus_minio_link: string;
    total_blocks: number;
}