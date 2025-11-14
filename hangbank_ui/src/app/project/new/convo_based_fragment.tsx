"use client";

import api from "@/app/axios";
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
} from "@mui/material";
import { t } from "i18next";
import { useEffect, useState } from "react";

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
  invokeNextStep: (val: {}) => void;
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
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableMics, setAvailableMics] = useState<Mic[]>([]);
  //When configuring this project, we do not set the Dataset title here, only when we choose the topic

  //TODO selected...
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType | null>(
    null
  );
  const [selectedFrequency, setSelectedFrequency] = useState<SampleRate>(22500);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMic, setSelectedMic] = useState<Mic | null>(null);

  //TODO: this will only be needed when we handle user-user convo
  // const [userMicPairs, setUserMicPairs] = useState<{ user: User; mic: Mic }[]>([]);

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

    async function fetchAvailableUsers() {
      try {
        const response = await api.get<User[]>("/user");
        setAvailableUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    async function fetchAvailableMics() {
      try {
        const response = await api.get<Mic[]>("/microphone");
        setAvailableMics(response.data);
      } catch (error) {
        console.error("Error fetching microphones:", error);
      }
    }

    fetchAvailableModels();
    fetchAvailableLanguages();
    fetchAvailableUsers();
    fetchAvailableMics();
  }, []);

  const handleButtonClick = () => {
    if (!selectedModel || !selectedLanguage || !selectedUser || !selectedMic) {
      showMessage(t("pls_fill_all_fields"), Severity.error);
      return;
    }

    invokeNextStep({});
  };

  return (
    <>
      <Box p={4} sx={{ display: "flex", justifyContent: "center" }}>
        <Paper sx={{ width: "65%", padding: 4 }}>
          <Typography sx={{ paddingBottom: 4 }} variant="h4" align="center">
            {t("config_your_project")}
          </Typography>

          <Grid container spacing={2}>
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
                fullWidth
                value={selectedUser ? selectedUser.id : ""}
                displayEmpty
                onChange={(e) => {
                  const user = availableUsers.find(
                    (u) => u.id === e.target.value
                  );
                  setSelectedUser(user || null);
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
                value={selectedMic ? selectedMic.deviceId : ""}
                displayEmpty
                onChange={(e) => {
                  const mic = availableMics.find(
                    (m) => m.deviceId === e.target.value
                  );
                  setSelectedMic(mic || null);
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
