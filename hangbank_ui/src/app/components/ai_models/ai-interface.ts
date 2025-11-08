//TODO: save chat history and load it later
export interface AIModel{
    apiKey: string;
    modelName: string;
    chat?: any; //Can be null, if you are not currently talking to the model via chat
    createChat: () => Promise<any>;
    sendMessage: (message: string) => Promise<string>; //result is a string from the model
}