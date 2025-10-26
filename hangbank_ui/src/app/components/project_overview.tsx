import { Mic, Save } from "@mui/icons-material";
import { Box, Paper, Typography, Button, Grid } from "@mui/material";
import { t } from "i18next";
import CorpusBlockCard from "./corpus_block_card";
import { useState } from "react";
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
}

interface ProjectOverviewProps {
  projectTitle: string;
  speakers: SpeakerType[]; //TODO: perhaps make it a list for Mode 2
  corpus: CorpusHeaderType;
  context?: string;
  corpusBlocks: CorpusBlockType[];

  projectId?: string;
}

export default function ProjectOverview({
  projectTitle,
  speakers,
  corpus,
  context,
  corpusBlocks,
  projectId,
}: ProjectOverviewProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { showMessage } = useSnackbar();
  const { data: session } = useSession();
  const [saveButtonDisabled, setSaveButtonDisabled] = useState<boolean>(false);

  const saveProject = async () => {
    //TODO: handle convoResult too!!

    // if (!corpusResult) {
    //   showMessage("corpusResult error", Severity.error); //TODO show message
    //   return;
    // }

    try {
      if (!session) throw new Error("User is not logged in!");
      await api.post("/dataset", {
        projectName: projectTitle,
        recordingContext: context,
        speakers: speakers.map((s) => {
          return {
            id: s.user.id,
            mic_deviceId: s.mic.deviceId,
            mic_label: s.mic.deviceLabel,
          };
        }),
        corpus_id: corpus.id,
        creator_id: session.user.id,
      });
      showMessage(t("project_saved"), Severity.success);
      setSaveButtonDisabled(true);
    } catch (err) {
      showMessage("error", Severity.error); //TODO error message translation
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
              {t("corpus")}: {corpus.name}
            </Typography>
            {context && (
              <Typography>
                {t("recording_context")}: {context}
              </Typography>
            )}
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
            <Button onClick={()=> {router.push(`/record/corpus/${projectId}/0`)}} variant="contained" endIcon={<Mic />}>
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
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </>
  );
}
