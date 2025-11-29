import api from "@/app/axios";
import { AIModel } from "./ai-interface";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

export default class GeminiAI implements AIModel {
  readonly apiKey: string;
  readonly modelName: string;
  chat: any;
  ai: GoogleGenAI;
  language: string = "en";
  initialPrompt: string = `Írj témákat, amikről tudnánk beszélgetni. Ha kiválasztottam valamelyiket, akkor te kérdezz, én meg válaszolok rá. A témák kiírásánál csak a témákat írd ki sorszámozva, más szöveg ne szerepeljen. Ne használj díszítőelemeket (pl. félkövér szöveg, **, stb.)`;

  createChat = async () => {
    this.chat = this.ai.chats.create({ model: this.modelName });
  };

  //Returns the first response of the AI model
  startChat = async () => {
    if (!this.chat) {
      console.log("Initializing chat");
      await this.createChat();
    }

    if (this.language != "hu-HU") {
      this.initialPrompt =
        this.initialPrompt +
        `Kizárólag a következő nyelven beszélgessünk, a témákat is ezen a nyelven írd: ${this.language}`;
      // const translatePrompt = `Fordítsd le a következő szöveget a következő nyelvre: ${this.language}\n${this.initialPrompt}. A válaszod csakis a fordított szövegből álljon!`;
      // try{
      //     console.log("Sending translation message");
      //     const translatedResponse = await this.chat.sendMessage({ message: translatePrompt });
      //     this.initialPrompt = translatedResponse.text;
      // }catch(error){
      //     console.error("Error translating initial prompt:", error);
      // }
    }

    //Sending first message to the AI to receive topics we can talk about

    const initialResponse = await this.chat.sendMessage({
      message: this.initialPrompt,
    });
    console.log(initialResponse);
    return initialResponse.text;
  };

  sendMessage = async (message: string) => {
    if (!this.chat) {
      throw new Error(
        "Chat is not yet initialized. You can initialize it with StartChat()"
      );
    }
    try {
      const res = await this.chat.sendMessage({ message: message });
      return res.text;
    } catch (error) {
      console.error("Error sending message to GeminiAI:", error);
    }
  };

  continueChat = async (
    topic: string,
    messages: { text: string; aiSent: boolean }[]
  ) => {
    const prompt = `Szia! Egy korábbi beszélgetést folytatnék veled. Ez volt a téma: ${topic}. 
${
  messages.length > 0 &&
  "Ezek voltak az üzenetek:" +
    messages.map((m) => `${m.aiSent ? "Te" : "Én"}: ${m.text}`).join("\n")
}

Kizárólag a következő nyelven beszéljünk: ${this.language}.`;
    const initialResponse = await this.chat.sendMessage({ message: prompt });
    console.log(initialResponse);
    return initialResponse.text;
  };

  constructor(
    apiKey: string,
    modelName: string = "gemini-2.5-flash",
    language: string = "en"
  ) {
    // dotenv.config();
    this.apiKey = apiKey; //process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : (() => { throw new Error("Could not retrieve Gemini API key"); })();
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    this.modelName = modelName;
    this.language = language;
  }
}
