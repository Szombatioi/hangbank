import { Mic, Save, SmartToy } from "@mui/icons-material";
import { Box, Paper, Typography, Button, Grid, Icon } from "@mui/material";
import { t } from "i18next";
import CorpusBlockCard from "./corpus_block_card";
import { useEffect, useRef, useState } from "react";
import api, { getUserByToken } from "../axios";
import { Severity, useSnackbar } from "../contexts/SnackbarProvider";
import { useTranslation } from "react-i18next";
import { SpeakerType } from "../project/new/corpus_based_fragment";
import { CorpusBlockType, RecordingMode } from "../project/new/page";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export interface ConvoHeaderType {
  id: string;
  name: string;
}

interface ConvoProjectOverviewProps {
  title: string;
  aiModel: {
    name: string;
    model: string;
  };
  language: {
    code: string;
    name: string;
  };
  speaker: {
    id: string;
    name: string;
  };
  microphone: {
    deviceId: string;
    label: string;
  };
  samplingFrequency: number;
  speechDialect?: string;
  context?: string;
  projectId?: string;
}

export default function ConvoProjectOverview({
  title,
  aiModel,
  language,
  speaker,
  microphone,
  samplingFrequency,
  speechDialect,
  context,
  projectId,
}: ConvoProjectOverviewProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { showMessage } = useSnackbar();
  const [saveButtonDisabled, setSaveButtonDisabled] = useState<boolean>(false);
  const { user } = useAuth();
  const projectIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (projectId != null) projectIdRef.current = projectId;
    console.log("ProjectId provided: ", projectId);
  }, []);

  const startRecordingPage = async () => {
    if (projectIdRef.current !== null) {
      // showMessage(t("project_already_exists"), Severity.warning);
      router.push(`/record/convo/${projectIdRef.current}`);
      return;
    }
    console.log("Saving project before going to next page");
    const resDatasetId = await saveProject();
    router.push(`/record/convo/${resDatasetId}`);
  };

  const saveProject = async () => {
    try {
      const res = await api.post("/dataset", {
        projectName: title,
        mode: RecordingMode.Conversation,
        recordingContext: null, //We do not set it, because this will be our selected topic!
        language: language.code,
        speakers: [
          {
            id: speaker.id,
            mic_deviceId: microphone.deviceId,
            mic_label: microphone.label,
            samplingFrequency: samplingFrequency,
            speechDialect: speechDialect,
          },
        ],
        creator_id: user!.id,
        aiModel_id: aiModel.name
      });
      projectIdRef.current = res.data.id;

      showMessage(t("project_saved"), Severity.success);
      setSaveButtonDisabled(true);
      return res.data.id;
    } catch (err) {
      showMessage("error", Severity.error);
      throw new Error();
    }
  };

  return (
    <>
      <Box m={8} sx={{ display: "flex", justifyContent: "center" }}>
        <Paper elevation={3} sx={{ width: "65%", padding: 4 }}>
          <div style={{ margin: 8 }}>
            {/* Result of previos (config) step */}
            <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
              <Icon fontSize="large">
                <SmartToy fontSize="large" />
              </Icon>
              <Typography variant="h4" align="center">
                {t("overview")}
              </Typography>
            </div>
            <Typography>
              {t("project")}: {title}
            </Typography>
            <Typography>
              {t("speakers")}: {speaker.name}
            </Typography>{" "}
            {/*TODO: speaker.name or ID */}
            <Typography>
              {t("microphone")}: {microphone.label}
              {/*TODO: use as list.  Perhaps replace user, mic with Speaker entity */}
            </Typography>
            <Typography>
              {t("sample_frequency")}: {samplingFrequency} Hz{" "}
              {/*TODO: use as list.  Perhaps replace user, mic with Speaker entity */}
            </Typography>
            <Typography>
              {t("language")}: {language.name}
            </Typography>
            {context && (
              <Typography>
                {t("recording_context")}: {context}
              </Typography>
            )}
            <Typography>
              {t("speech_dialect")}:{" "}
              {speechDialect != null && speechDialect != ""
                ? speechDialect
                : "-"}
            </Typography>
          </div>
          {/* Button to start recording from the first non-finished block */}
          <div
            style={{
              margin: 12,
              display: "flex",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <Button
              onClick={() => {
                startRecordingPage();
              }}
              variant="contained"
              endIcon={<Mic />}
            >
              {t("start")}
            </Button>
            {!projectId && (
              <Button
                disabled={saveButtonDisabled}
                onClick={() => {
                  saveProject();
                }}
                variant="contained"
                endIcon={<Save />}
              >
                {t("save")}
              </Button>
            )}
          </div>
        </Paper>
      </Box>
    </>
  );
}
