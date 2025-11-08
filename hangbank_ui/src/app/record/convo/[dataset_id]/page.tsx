"use client";
import { AIModel } from "@/app/components/ai_models/ai-interface";
import GeminiAI from "@/app/components/ai_models/Gemini";
import {
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Recorder from "../../recorder copy";

export default function ConvoBasedRecordingPage() {
  //TODO fetch dataset_id param
  //TODO: fetch mic deviceID
  //TODO save chat history
  //TODO handle space to send current message (now it is only a button click)
  //Init AI model
  //TODO useEffect to fetch ai model, now we'll use a temporary value
  const ai_model_name = "gemini-2.5-flash";
//   const [aiModel, setAiModel] = useState<AIModel | null>(null);
    const aiModelRef = useRef<AIModel | null>(null);
  const [possibleTopics, setPossibleTopics] = useState<string[]>([]);

//   const [transcription, setTranscription] = useState<string | null>(null);
    const transcriptRef = useRef<string | null>(null);

  const [isWaitingForResponse, setIsWaitingForResponse] =
    useState<boolean>(false);

  const [responses, setResponses] = useState<string[]>([]);

  //TODO fetch language for the dataset
  const [language, setLanguage] = useState("hu-HU");

  //TODO replace with device ID fetch
  const [microphoneDeviceId, setMicrophoneDeviceId] = useState(
    "06b13ea600dcbe5762bc2d1827cd2b7400d913e1db4616ce161f7d577c40e0be"
  );

  const hasStartedChat = useRef(false);
  const topicSelected = useRef(false);

  const sendMessage = async () => {
    console.log(transcriptRef.current)
    if (!transcriptRef || !transcriptRef.current) return;

    setIsWaitingForResponse(true);
    console.log("Ref: ", transcriptRef.current)
    console.log("Is AI model null? ", aiModelRef.current === null)
    const res = await aiModelRef.current!.sendMessage(transcriptRef.current);
    setResponses((prev) => [...prev, res]);
    // setTranscription(null);
    transcriptRef.current = null;
    setIsWaitingForResponse(false);
  };

  useEffect(() => {
    async function startChat() {
      if (hasStartedChat.current) return;
      hasStartedChat.current = true;

      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        let model = new GeminiAI(apiKey!, ai_model_name, language);
        aiModelRef.current = model;

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

  //Handle Spacebar press to send the message to the AI
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault(); // prevents scrolling the page
        sendMessage();
        console.log("Space pressed")
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const chooseTopicNumber = async (index: number) => {
    try {
      const res = await aiModelRef.current!.sendMessage(`${index}`);
      console.log("Res: ", res);
      setResponses((prev) => [...prev, res]);
      topicSelected.current = true;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {aiModelRef && aiModelRef.current ? (
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
              {topicSelected.current && (
                <>
                  {responses.map((r, i) => (
                    <Typography key={i}>{r}</Typography>
                  ))}

                  <TextField
                    value={transcriptRef.current ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        transcriptRef.current = e.target.value;
                    }}
                  ></TextField>
                  <Button
                    onClick={() => {
                      sendMessage();
                    }}
                  >
                    Send
                  </Button>

                  {/*TODO: Add onRecordingStop and onSpacePress*/}
                  <Recorder
                    selectedDeviceId={microphoneDeviceId}
                    save_freq_ms={1000}
                    useTranscript={true}
                    onAudioUpdate={() => {}}
                    onRecordingStop={() => {}}
                    // onSpacePress={sendMessage}
                    language={language}
                    onTranscriptUpdate={(t) => {
                      transcriptRef.current = t;
                      console.log(t);
                    //   console.log(transcription);
                    }}
                  />
                </>
              )}
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
