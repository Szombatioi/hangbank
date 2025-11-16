import { Mic, Save } from "@mui/icons-material";
import { Box, Paper, Typography, Button, Grid } from "@mui/material";
import { t } from "i18next";
import CorpusBlockCard from "./corpus_block_card";
import { useEffect, useRef, useState } from "react";
import api from "../axios";
import { Severity, useSnackbar } from "../contexts/SnackbarProvider";
import { useTranslation } from "react-i18next";
import { SpeakerType } from "../project/new/corpus_based_fragment";
import { useSession } from "next-auth/react";
import { CorpusBlockType } from "../project/new/page";
import { useRouter } from "next/navigation";

export interface CorpusHeaderType {
  id: string;
  name: string;
  language: string;
}

interface CorpusProjectOverviewProps {
  projectTitle: string;
  speakers: SpeakerType[]; //TODO: perhaps make it a list for Mode 2
  corpus: CorpusHeaderType;
  context?: string;
  speechDialect?: string | null;
  corpusBlocks: CorpusBlockType[];
  samplingFrequency: number;
  projectId?: string;
}

export default function CorpusProjectOverview({
  projectTitle,
  speakers,
  corpus,
  context,
  speechDialect,
  corpusBlocks,
  projectId,
  samplingFrequency
}: CorpusProjectOverviewProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { showMessage } = useSnackbar();
  const { data: session } = useSession();
  const [saveButtonDisabled, setSaveButtonDisabled] = useState<boolean>(false);
  const projectIdRef = useRef<string | null>(null);

  useEffect(() => {
    if(projectId != null) projectIdRef.current = projectId;
    console.log("ProjectId provided: ", projectId);
  }, []);

  const startRecordingPage = async (index: number = 0) => {
    if(projectIdRef.current !== null) {
      // showMessage(t("project_already_exists"), Severity.warning);
      router.push(`/record/corpus/${projectIdRef.current}/${index}`);
      return;
    }
    console.log("Saving project before going to next page")
    const resDatasetId = await saveProject();
    router.push(`/record/corpus/${resDatasetId}/${index}`);
  }

  const saveProject = async () => {
    //TODO: handle convoResult too!!

    // if (!corpusResult) {
    //   showMessage("corpusResult error", Severity.error); //TODO show message
    //   return;
    // }

    try {
      if (!session) throw new Error("User is not logged in!");
      const res = await api.post("/dataset", {
        projectName: projectTitle,
        mode: 1,
        recordingContext: context,
        speakers: speakers.map((s) => {
          return {
            id: s.user.id,
            mic_deviceId: s.mic.deviceId,
            mic_label: s.mic.deviceLabel,
            samplingFrequency: samplingFrequency,
            speechDialect: speechDialect
          };
        }),
        corpus_id: corpus.id,
        creator_id: session.user.id,
      });
      projectIdRef.current = res.data.id;
      console.log("projectId", projectId);
      console.log("res.data", res.data);

      showMessage(t("project_saved"), Severity.success);
      setSaveButtonDisabled(true);
      return res.data.id;
    } catch (err) {
      showMessage("error", Severity.error); //TODO error message translation
      throw new Error();
    }
  };
  return (
    <>
      <Box m={8} sx={{ display: "flex", justifyContent: "center" }}>
        <Paper elevation={3} sx={{ width: "65%", padding: 4 }}>
          <div style={{ margin: 8 }}>
            {/* Result of previos (config) step */}
            <Typography variant="h4" align="center">
              {t("overview")}
            </Typography>
            <Typography>
              {t("project")}: {projectTitle}
            </Typography>
            <Typography>
              {t("speakers")}: {speakers.map((s)=> s.user.name).join(",")}
            </Typography>{" "}
            {/*TODO: speaker.name or ID */}
            <Typography>
              {t("microphone")}: {speakers[0].mic.deviceLabel} {/*TODO: use as list.  Perhaps replace user, mic with Speaker entity */}
            </Typography>
            <Typography>
              {t("sample_frequency")}: {samplingFrequency} Hz {/*TODO: use as list.  Perhaps replace user, mic with Speaker entity */}
            </Typography>
            <Typography>
              {t("corpus")}: {corpus.name}
            </Typography>
            <Typography>
              {t("language")}: {corpus.language}
            </Typography>
            {context && (
              <Typography>
                {t("recording_context")}: {context}
              </Typography>
            )}
            <Typography>
              {t("speech_dialect")}: {speechDialect != null && speechDialect != "" ? speechDialect : "-"}
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
            <Button onClick={()=> {startRecordingPage()}} variant="contained" endIcon={<Mic />}>
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

          <Grid container spacing={2}>
            {corpusBlocks.map((block, index) => (
              <Grid size={4} key={index}>
                <CorpusBlockCard
                  sequence={block.sequence}
                  filename={block.filename}
                  status={block.status}
                  onStartProject={() => startRecordingPage(index)}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </>
  );
}
