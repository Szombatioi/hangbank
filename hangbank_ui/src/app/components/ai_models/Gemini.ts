import api from "@/app/axios";
import { AIModel } from "./ai-interface";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';

export default class GeminiAI implements AIModel{
    readonly apiKey: string;
    readonly modelName: string;
    chat: any;
    ai: GoogleGenAI;
    language: string = "en";
    initialPrompt: string = "Írj témákat, amikről tudnánk beszélgetni. Ha kiválasztottam valamelyiket, akkor te kérdezz, én meg válaszolok rá. A témák kiírásánál csak a témákat írd ki sorszámozva, más szöveg ne szerepeljen.";

    createChat = async () => {
        this.chat = this.ai.chats.create({model: this.modelName});
    };

    //Returns the first response of the AI model
    startChat = async () => {
        if(this.language != "hu-HU"){
            const translatePrompt = `Fordítsd le a következő szöveget a következő nyelvre: ${this.language}\n${this.initialPrompt}`;
            try{
                const translatedResponse = await this.chat.sendMessage({ message: translatePrompt });
                this.initialPrompt = translatedResponse.text;

                //Sending first message to the AI to receive topics we can talk about
                const initialResponse = await this.chat.sendMessage({ message: this.initialPrompt });
                return initialResponse.text;
            }catch(error){
                console.error("Error translating initial prompt:", error);
            }
        }
    }

    sendMessage = async (message: string) => {
        if(!this.chat){
            await this.createChat();
        }
        try{
            return this.chat.sendMessage({ message: message });
        } catch(error){
            console.error("Error sending message to GeminiAI:", error);
        }  
    };

    constructor(modelName: string = "gemini-2.5-flash", language: string = "en"){
        dotenv.config();
        this.apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : (() => { throw new Error("Could not initialize GeminiAI"); })();
        this.ai = new GoogleGenAI({apiKey: this.apiKey});
        this.modelName = modelName;
        this.language = language;
    }

}