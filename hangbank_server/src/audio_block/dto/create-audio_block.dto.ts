import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateAudioBlockDto {
    datasetId: string;
    speakerId: number;
    corpusBlockId?: string; //Nullable because of mode 2 and 3
    transcript?: string; //Nullable because of mode 2 and 3
    @IsOptional()
    @Transform(({ value }) => {
        // Ha stringként érkezik (FormData), parse-oljuk
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (error) {
                return value;
            }
        }
        return value;
    })
    chatHistory?: {
        text: string;
        aiSent: boolean;
        createdAt: Date;
    };
    selectedTopic?: string;
    // chatHistory?: {
    //   text: string;
    //   aiSent: boolean;
    //   aiModelName: string;
    //   createdAt: Date;
    // };
}
