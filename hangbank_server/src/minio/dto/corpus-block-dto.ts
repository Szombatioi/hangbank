import { CorpusBlock } from "src/corpus_block/entities/corpus_block.entity";

export interface CorpusBlockDTO {
    corpusBlock: CorpusBlock;
    text: string;
}