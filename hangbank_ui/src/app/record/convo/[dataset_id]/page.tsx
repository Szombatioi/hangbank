"use client";
import { AIModel } from "@/app/components/ai_models/ai-interface";
import GeminiAI from "@/app/components/ai_models/Gemini";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Recorder from "../../recorder copy";
import TTSSpeaker, { TTSHandle } from "@/app/components/tts_speaker";
import { useTranslation } from "react-i18next";
import HighQualityRecorder from "@/app/components/recorder/high_quality_recorder";
import ChatBubble from "@/app/components/chat-bubble";
import { useParams } from "next/navigation";
import api from "@/app/axios";
import { DatasetConvoType } from "@/app/my_datasets/overview/[id]/[type]/page";
import { Severity, useSnackbar } from "@/app/contexts/SnackbarProvider";
import { Save } from "@mui/icons-material";

interface SaveableConvoType {
  blob: Blob | null;
  aiChat: {
    text: string;
    aiSent: boolean;
    aiModelName: string;
    createdAt: Date;
  };
}

export default function ConvoBasedRecordingPage() {
  const { t } = useTranslation("common");
  const { showMessage } = useSnackbar();
  const params = useParams<{ dataset_id: string }>();
  const [dataset, setDataset] = useState<DatasetConvoType | null>(null);
  const datasetRef = useRef<DatasetConvoType | null>(null);

  const [actualBlob, setActualBlob] = useState<Blob | null>(null);
  const actualBlobRef = useRef<Blob | null>(null);

  const aiModelRef = useRef<AIModel | null>(null);
  const [possibleTopics, setPossibleTopics] = useState<string[]>([]);

  const [transcription, setTranscription] = useState<string | null>(null);
  const transcriptRef = useRef<string | null>(null);

  const [isWaitingForResponse, setIsWaitingForResponse] =
    useState<boolean>(false);

  const [responses, setResponses] = useState<
    { text: string; aiSent: boolean; createdAt: Date }[]
  >([]);

  const hasStartedChat = useRef(false);
  const topicSelected = useRef(false);
  const ttsSpeakerRef = useRef<TTSHandle>(null);

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const saveableItemsRef = useRef<SaveableConvoType[]>([]);

  useEffect(() => {
    datasetRef.current = dataset;
  }, [dataset]);

  useEffect(() => {
    actualBlobRef.current = actualBlob;
  }, [actualBlob]);

  useEffect(() => {
    transcriptRef.current = transcription;
  }, [transcription]);

  useEffect(() => {
    if (!params || !params.dataset_id) {
      showMessage(t("dataset_id_not_provided"), Severity.error);
      return;
    }
    async function fetchDataset() {
      try {
        const dataset_res = await api.get<DatasetConvoType>(
          `/dataset/${params.dataset_id}`
        );
        setDataset(dataset_res.data);

        //Set previous responses
        responses.push(
          ...dataset_res.data.chatHistory.map((c) => ({
            text: c.text,
            aiSent: c.aiSent,
            createdAt: c.createdAt,
          }))
        );

        console.log(dataset_res.data);
        if(dataset_res.data.context){
          topicSelected.current = true;
          setSelectedTopic(dataset_res.data.context);
        }
      } catch (err) {
        showMessage(t("could_not_load_datasets"), Severity.error);
      }
    }

    fetchDataset();
  }, [params]);
  //TODO fetch dataset_id param
  //TODO: fetch mic deviceID
  //TODO save chat history
  //TODO handle space to send current message (now it is only a button click)
  //Init AI model
  //TODO useEffect to fetch ai model, now we'll use a temporary value
  //   const [aiModel, setAiModel] = useState<AIModel | null>(null)

  const sendMessage = async () => {
    console.log(transcriptRef.current);
    if (!transcriptRef || !transcriptRef.current) return;

    setIsWaitingForResponse(true);
    console.log("Ref: ", transcriptRef.current);
    console.log("Is AI model null? ", aiModelRef.current === null);
    const res = await aiModelRef.current!.sendMessage(transcriptRef.current);
    if (!transcriptRef.current) throw Error("Transcript is null!");

    setResponses((prev) => [
      ...prev,
      { text: transcriptRef.current!, aiSent: false, createdAt: new Date() },
    ]);

    if (ttsSpeakerRef.current) ttsSpeakerRef.current.speak(res);
    setResponses((prev) => [
      ...prev,
      { text: res, aiSent: true, createdAt: new Date() },
    ]);

    console.log(
      "Dataset ref before saveableitemsref push: ",
      datasetRef.current
    );
    console.log("Dataset before saveableitemsref push: ", dataset);
    if (!actualBlobRef.current) throw Error("Actual blob is null!");
    saveableItemsRef.current.push({
      blob: actualBlobRef!.current,
      aiChat: {
        text: transcriptRef.current,
        aiSent: false,
        aiModelName: datasetRef.current!.aiModel.model,
        createdAt: new Date(),
      },
    });

    console.log("Saveable items: ", saveableItemsRef.current);
    setTranscription(null);
    setIsWaitingForResponse(false);
  };

  useEffect(() => {
    if (!datasetRef.current || !dataset) return;
    async function startChat() {
      if (hasStartedChat.current) return;
      hasStartedChat.current = true;

      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        let model = new GeminiAI(
          apiKey!,
          datasetRef.current?.aiModel.model,
          datasetRef.current?.language.code
        );
        console.log("Model: ", model);
        aiModelRef.current = model;

        setIsWaitingForResponse(true);
        //TODO: load history here if there is any and prevent startChat
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
  }, [dataset, datasetRef.current]);

  //Handle Spacebar press to send the message to the AI
  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.code === "Space") {
  //       // event.preventDefault(); // prevents scrolling the page

  //       console.log("Space pressed");
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  const chooseTopicNumber = async (index: number) => {
    try {
      setSelectedTopic(possibleTopics[index-1])
      const res = await aiModelRef.current!.sendMessage(`${index}`);
      console.log("Res: ", res);
      setResponses((prev) => [
        ...prev,
        { text: res, aiSent: true, createdAt: new Date() },
      ]);
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

  const saveProgress = async () => {
    console.log("Save progress: ", saveableItemsRef.current);
    //corpusBlockId, datasetId, speakerId, and the Blob as File form
    if (!datasetRef || !datasetRef.current) {
      console.log("Could not save progress");
      showMessage(t("could_not_save_progress"), Severity.error);
      return;
    }

    const tasks = [];
    const errors: string[] = [];
    saveableItemsRef.current.forEach((a, i) => {
      console.log("Blob ", a.blob);

      const formData = new FormData();
      console.log("I: ", i);
      if(selectedTopic && i === 0){
        console.log("Sending selected topic too: ", selectedTopic.replace(/^\s*\d+[\.\)]\s*/, ""));
        formData.append("selectedTopic", selectedTopic!);
      }
      if(a.blob){
        formData.append("file", a.blob); //Blob is a .wav blob
      }
      else{
        // formData.append("file", null);
      }
      formData.append("datasetId", datasetRef!.current!.id);
      formData.append(
        "speakerId",
        datasetRef.current!.speakers[0].id.toString()
      ); //datasetRef!.current!.speakers[0].id);
      formData.append("chatHistory", JSON.stringify(a.aiChat));

      const task = api
        .post("/audio-block", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .catch((e) => {
          errors.push(e);
        });

      tasks.push(task);
    });

    console.log("Any errors?");
    if (errors.length > 0) {
      showMessage(`${t("errors_occured")}: ${errors.join("\n")}`);
    }
  };

  if (!datasetRef.current || !dataset) return <CircularProgress />;

  return (
    <>
      <Box sx={{ p: 2, width: "80%", justifySelf: "center" }}>
        <Paper sx={{ p: 2 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div></div>
            <Typography variant="h3" align="center">
              {t("dataset")}: {dataset?.projectTitle}
            </Typography>
            <Tooltip title={t("save")}>
              <IconButton onClick={() => saveProgress()}>
                <Save />
              </IconButton>
            </Tooltip>
          </div>
          {aiModelRef && aiModelRef.current ? (
            <>
              <TTSSpeaker
                lang={datasetRef.current.language.code}
                ref={ttsSpeakerRef}
              />
              {!isWaitingForResponse && !topicSelected.current && (
                <>
                  <Paper
                    elevation={0}
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
                  width: "75%",
                  overflowY: "auto",
                  // border: "1px solid red",
                  overflowX: "hidden",
                  scrollbarGutter: "stable",
                  mx: "auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                {responses.map((r, i) => (
                  <ChatBubble
                    key={i}
                    text={r.text}
                    side={r.aiSent ? "left" : "right"}
                  />
                  // <Paper
                  //   sx={{
                  //     justifySelf: "center",
                  //     mx: "auto",
                  //     textAlign: "center",
                  //     width: "75vw",
                  //     padding: 2,
                  //     marginBottom: 2,
                  //   }}
                  //   key={i}
                  // >
                  //   <Typography>{r}</Typography>
                  // </Paper>
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
                      <HighQualityRecorder
                        sampleRate={
                          datasetRef.current.speakers[0].samplingFrequency
                        }
                        deviceId={datasetRef.current.speakers[0].mic.deviceId}
                        useTranscript={true}
                        stopButtonSendSpaceClick={false}
                        onSpacePress={(blob: Blob) => {
                          console.log("Blob: ", blob);
                          setActualBlob(blob);
                          sendMessage();
                        }}
                        continueRecordingOnSpace={false}
                        onTranscriptUpdate={(t) => {
                          setTranscription(t);
                        }}
                        language={datasetRef.current.language.code}
                        //onRecorderStop={}
                      />
                      {/* <Recorder
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
                  /> */}
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
        </Paper>
      </Box>
    </>
  );
}
