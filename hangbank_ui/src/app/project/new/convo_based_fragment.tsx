"use client";

import api from "@/app/axios";
import { useAuth } from "@/app/contexts/AuthContext";
import { Severity, useSnackbar } from "@/app/contexts/SnackbarProvider";
import { SampleRate, sampleRates } from "@/app/record/sampleRateType";
import { Search } from "@mui/icons-material";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { ConvoResultType } from "./page";
import { SpeakerType } from "./corpus_based_fragment";

interface AIModel {
  name: string;
  modelName: string;
}

export interface LanguageType {
  code: string;
  name: string;
}

interface User {
  id: string;
  username: string;
  name: string;
}

interface Mic {
  label: string;
  deviceId: string;
}

export interface ConvoBasedFragmentProps {
  invokeNextStep: (val: ConvoResultType) => void;
}

export default function ConvoBasedFragment({
  invokeNextStep,
}: ConvoBasedFragmentProps) {
  const { showMessage } = useSnackbar();
  //TODO: handle error if the AI model is unavailable (e.g. when token limit is reached)

  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<LanguageType[]>(
    []
  );
  const { user } = useAuth();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableMics, setAvailableMics] = useState<Mic[]>([]);
  //When configuring this project, we do not set the Dataset title here, only when we choose the topic

  //TODO selected...
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType | null>(
    null
  );
  const [selectedFrequency, setSelectedFrequency] = useState<SampleRate>(22500);
  const [speaker, setSpeaker] = useState<SpeakerType | null>(null);
  const [selectedMic, setSelectedMic] = useState<string | null>(null);
  
  const [projectTitle, setProjectTitle] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [speechDialect, setSpeechDialect] = useState<string>("");

  //TODO: this will only be needed when we handle user-user convo
  // const [userMicPairs, setUserMicPairs] = useState<{ user: User; mic: Mic }[]>([]);

  useEffect(() => {
    async function getMicrophones() {
      try {
        // Check permission status first
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        setAvailableMics(audioInputs);
        if (audioInputs.length > 0) {
          setSelectedMic(audioInputs[0].deviceId);
          //To fill Speaker input

          if (user!.id && user!.name) {
            setSpeaker({
              id: 0,
              user: { id: user!.id, name: user!.name },
              mic: {
                deviceId: audioInputs[0].deviceId,
                deviceLabel: audioInputs[0].label,
              },
              samplingFrequency: 0
            }); //TODO:
          }
        }

        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error(err);
        setError("Could not access microphones.");
      }
    }
    getMicrophones();
  }, []);

  //fetching available elements
  useEffect(() => {
    async function fetchAvailableModels() {
      try {
        const response = await api.get<AIModel[]>("/ai-model");
        setAvailableModels(response.data);
        setSelectedModel(response.data[0] || null);
      } catch (error) {
        console.error("Error fetching AI models:", error); //TODO: snackbar
      }
    }

    async function fetchAvailableLanguages() {
      try {
        const response = await api.get<LanguageType[]>("/language");
        setAvailableLanguages(response.data);
        setSelectedLanguage(response.data[0] || null);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    }

    // async function fetchAvailableUsers() {
    //   try {
        
    //   } catch (error) {
    //     console.error("Error fetching users:", error);
    //   }
    // }

    // async function fetchAvailableMics() {
    //   try {
    //     const response = await api.get<Mic[]>("/microphone");
    //     setAvailableMics(response.data);
    //   } catch (error) {
    //     console.error("Error fetching microphones:", error);
    //   }
    // }

    fetchAvailableModels();
    fetchAvailableLanguages();
    // fetchAvailableUsers();
    // fetchAvailableMics();
  }, []);

  const handleButtonClick = () => {
    if (!projectTitle || !selectedModel || !selectedLanguage || !speaker || !selectedMic) {
      showMessage(t("pls_fill_all_fields"), Severity.error);
      return;
    }

    const selectedMicLabel = availableMics.find((m) => m.deviceId === selectedMic)!.label;
    invokeNextStep({
      title: projectTitle,
      aiModel: {
        name: selectedModel.name,
        model: selectedModel.modelName,
      },
      language: {
        code: selectedLanguage.code,
        name: selectedLanguage.name,
      },
      speaker: {
        id: speaker.id,
        name: speaker.user.name
      },
      microphone: {
        deviceId: selectedMic,
        label: selectedMicLabel,
      },
      samplingFrequency: selectedFrequency,
      speechDialect: speechDialect,
      context: context,
    });
  };

  if (!user) return <CircularProgress />;

  return (
    <>
      <Box p={4} sx={{ display: "flex", justifyContent: "center" }}>
        <Paper sx={{ width: "65%", padding: 4 }}>
          <Typography sx={{ paddingBottom: 4 }} variant="h4" align="center">
            {t("config_your_project")}
          </Typography>

          <Grid container spacing={2}>
          <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ width: 200, fontWeight: 500 }}>
                {t("title")}:
              </Typography>
            </Grid>
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                placeholder={t("enter_title")}
                required
                value={projectTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setProjectTitle(e.target.value);
                }}
              />
            </Grid>
            {/* Model */}
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ width: 200, fontWeight: 500 }}>
                {t("ai_model")}:
              </Typography>
            </Grid>

            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Select
                fullWidth
                value={selectedModel ? selectedModel.modelName : ""}
                onChange={(e) => {
                  const model = availableModels.find(
                    (m) => m.modelName === e.target.value
                  );
                  setSelectedModel(model || null);
                }}
              >
                {availableModels.map((model) => (
                  <MenuItem key={model.modelName} value={model.modelName}>
                    {model.name} ({model.modelName})
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Language */}
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ width: 200, fontWeight: 500 }}>
                {t("language")}:
              </Typography>
            </Grid>

            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Select
                fullWidth
                value={selectedLanguage ? selectedLanguage.code : ""}
                onChange={(e) => {
                  const language = availableLanguages.find(
                    (l) => l.code === e.target.value
                  );
                  setSelectedLanguage(language || null);
                }}
              >
                {availableLanguages.map((language) => (
                  <MenuItem key={language.code} value={language.code}>
                    {language.name} ({language.code})
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* User */}
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ width: 200, fontWeight: 500 }}>
                {t("user")}:
              </Typography>
            </Grid>
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Select
                disabled
                fullWidth
                value={speaker?.user.name + " (You)"}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) return t("select_user");
                  // const u = availableUsers.find((user) => user.id === selected);
                  // var text = u ? `${u.name} (${u.username})` : "";
                  // if(u && u.id === user.id) text += ` (${t("you")})`
                  return speaker?.user.name + "(You)";
                }}
                onChange={(e) => {
                  // const user = availableUsers.find(
                  //   (u) => u.id === e.target.value
                  // );
                  // setSpeaker(e.target.value);
                }}
              >
                <MenuItem value="" disabled>
                  {t("select_user")}
                </MenuItem>
                {availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.username})
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Microphone */}
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ width: 200, fontWeight: 500 }}>
                {t("microphone")}:
              </Typography>
            </Grid>
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Select
                fullWidth
                value={selectedMic ? selectedMic : ""}
                displayEmpty
                onChange={(e) => {
                  // const mic = availableMics.find(
                  //   (m) => m.deviceId === e.target.value
                  // );
                  setSelectedMic(e.target.value);
                }}
              >
                <MenuItem value="" disabled>
                  {t("select_your_microphone")}
                </MenuItem>
                {availableMics.map((mic) => (
                  <MenuItem key={mic.deviceId} value={mic.deviceId}>
                    {mic.label} ({mic.deviceId.slice(0, 10) + "..."})
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Sample frequency */}
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ width: 200, fontWeight: 500 }}>
                {t("sample_frequency")}:
              </Typography>
            </Grid>
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Select
                value={selectedFrequency}
                fullWidth
                onChange={(e) => setSelectedFrequency(e.target.value)}
              >
                {sampleRates.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s} Hz
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ width: 200, fontWeight: 500 }}>
                {t("speech_dialect")}:
              </Typography>
            </Grid>
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                multiline
                rows={5}
                fullWidth
                placeholder={t("enter_speech_dialect")}
                value={speechDialect ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSpeechDialect(e.target.value);
                }}
              />
            </Grid>
              
            {/* Context */}
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ width: 200, fontWeight: 500 }}>
                {t("recording_context")}:
              </Typography>
            </Grid>
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                multiline
                rows={5}
                fullWidth
                placeholder={t("opt_enter_context")}
                value={context}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setContext(e.target.value);
                }}
              />
            </Grid>
          </Grid>
          <div
            style={{ marginTop: 16, display: "flex", justifyContent: "center" }}
          >
            <Button
              onClick={() => {
                handleButtonClick();
              }}
              variant="contained"
            >
              {t("next")}
            </Button>
          </div>
        </Paper>
      </Box>
    </>
  );
}
function setError(arg0: string) {
  throw new Error("Function not implemented.");
}

