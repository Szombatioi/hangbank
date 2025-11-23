export class CreateAiChatHistoryDto {
    aiModelId: string;
    datasetId: string;
    aiSent: boolean;
    createdAt: Date;
    history: string;
}
