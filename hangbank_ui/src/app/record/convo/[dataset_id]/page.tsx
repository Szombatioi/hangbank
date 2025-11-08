"use client";
import { AIModel } from "@/app/components/ai_models/ai-interface";
import GeminiAI from "@/app/components/ai_models/Gemini";
import { Button, CircularProgress, Paper, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function ConvoBasedRecordingPage() {
  //TODO fetch dataset_id param

  //Init AI model
  //TODO useEffect to fetch ai model, now we'll use a temporary value
  const ai_model_name = "gemini-2.5-flash";
  const [aiModel, setAiModel] = useState<AIModel | null>(null);
  const [possibleTopics, setPossibleTopics] = useState<string[]>([]);

  const [isWaitingForResponse, setIsWaitingForResponse] =
    useState<boolean>(false);

  const [responses, setResponses] = useState<string[]>([]);

  //TODO fetch language for the dataset
  const [language, setLanguage] = useState("hu-HU");

  const hasStartedChat = useRef(false);
  const topicSelected = useRef(false);

  useEffect(() => {
    async function startChat() {
      if (hasStartedChat.current) return;
      hasStartedChat.current = true;

      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        let model = new GeminiAI(apiKey!, ai_model_name, language);
        setAiModel(model);

        setIsWaitingForResponse(true);
        const topics = await model.startChat();
        console.log(`Topics: ${topics}`);
        setPossibleTopics(topics.split("\n"));
        setIsWaitingForResponse(false);
        // setResponses((prev) => [...prev, initResponse]);
      } catch (err) {
        console.error("Could not initialize AI model: " + err);
      }
    }

    startChat();
  }, []);

  const chooseTopicNumber = async (index: number) => {
    try {
      const res = await aiModel!.sendMessage(`${index}`);
      console.log("Res: ", res);
      setResponses((prev) => [...prev, res]);
      topicSelected.current = true;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {aiModel ? (
        <>
          {!topicSelected.current &&
            possibleTopics.map((t, i) => (
              <Button
                key={i}
                onClick={() => {
                  chooseTopicNumber(i + 1);
                }}
              >
                <Paper elevation={3} sx={{ width: "512px" }}>
                  <Typography variant="h6">{t}</Typography>
                </Paper>
              </Button>
            ))}
          {isWaitingForResponse ? (
            <>
              <CircularProgress />
            </>
          ) : (
            <>
              {responses.map((r, i) => (
                <Typography key={i}>{r}</Typography>
              ))}
            </>
          )}
        </>
      ) : (
        <>
          <CircularProgress />
          <Typography variant="h4">The AI model is loading</Typography>
        </>
      )}
    </>
  );
}
