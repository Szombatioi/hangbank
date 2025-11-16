"use client";
import { AIModel } from "@/app/components/ai_models/ai-interface";
import GeminiAI from "@/app/components/ai_models/Gemini";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Recorder from "../../recorder copy";
import TTSSpeaker, { TTSHandle } from "@/app/components/tts_speaker";
import { useTranslation } from "react-i18next";

export default function ConvoBasedRecordingPage() {
  const { t } = useTranslation("common");
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
  const ttsSpeakerRef = useRef<TTSHandle>(null);

  const sendMessage = async () => {
    console.log(transcriptRef.current);
    if (!transcriptRef || !transcriptRef.current) return;

    setIsWaitingForResponse(true);
    console.log("Ref: ", transcriptRef.current);
    console.log("Is AI model null? ", aiModelRef.current === null);
    const res = await aiModelRef.current!.sendMessage(transcriptRef.current);
    setResponses((prev) => [...prev, res]);
    // setTranscription(null);
    transcriptRef.current = null;
    setIsWaitingForResponse(false);

    if (ttsSpeakerRef.current) ttsSpeakerRef.current.speak(res);
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
        console.log("Space pressed");
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
      if (ttsSpeakerRef.current) {
        ttsSpeakerRef.current.speak(res);
      } else {
        console.error("Topic választásnál nem szólalt meg a TTS modell.");
        console.error("TTS Ref: ", ttsSpeakerRef);
        console.error("TTS Ref current: ", ttsSpeakerRef.current);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {aiModelRef && aiModelRef.current ? (
        <>
          <TTSSpeaker lang={language} ref={ttsSpeakerRef} />
          {!isWaitingForResponse && !topicSelected.current && (
            <>
              <Paper
                elevation={4}
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    possibleTopics.length > 6 ? "repeat(2, 1fr)" : "1fr", // switch to 2 columns if many items
                  gap: 2,
                  p: 2,
                  justifyContent: "center",
                  alignItems: "flex-start",
                  width: "fit-content",
                  mx: "auto", // centers the Paper horizontally
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    gridColumn: "1 / -1", // make title span full width across both columns
                    textAlign: "center",
                    mb: 2,
                  }}
                >
                  {t("choose_a_topic")}
                </Typography>
                {possibleTopics.map((t, i) => (
                  <Button
                    key={i}
                    onClick={() => chooseTopicNumber(i + 1)}
                    sx={{ justifyContent: "flex-start" }}
                  >
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        width: "100%",
                        maxWidth: 512,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontSize: 18 }}>
                        {t}
                      </Typography>
                    </Paper>
                  </Button>
                ))}
              </Paper>
            </>
          )}
          <Box
            sx={{
              maxHeight: "35vh",
              width: "fit-content",
              overflowY: "auto",
              // border: "1px solid red",
              overflowX: "hidden",
              scrollbarGutter: "stable",
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center"
            }}
          >
            {responses.map((r, i) => (
              <Paper
                sx={{
                  justifySelf: "center",
                  mx: "auto",
                  textAlign: "center",
                  width: "75vw",
                  padding: 2,
                  marginBottom: 2,
                }}
                key={i}
              >
                <Typography>{r}</Typography>
              </Paper>
            ))}
          </Box>
          {isWaitingForResponse ? (
            <>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </div>
            </>
          ) : (
            <>
              {topicSelected.current && (
                <>
                  {/* This was temporary before the transcription */}
                  {/* <TextField
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
                  </Button> */}

                  {/*TODO: Add onRecordingStop and onSpacePress*/}
                  <Recorder
                    selectedDeviceId={microphoneDeviceId}
                    save_freq_ms={250}
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
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </div>
          <Typography variant="h4">The AI model is loading</Typography>
        </>
      )}
    </>
  );
}
