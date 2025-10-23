"use client";
import SelectCorpusDialog from "@/app/components/dialogs/select_corpus_dialog";
import { useSnackbar } from "@/app/contexts/SnackbarProvider";
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
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

//TODO: speaker is a dto, not string
export interface CorpusBasedFragmentProps {
  invokeNextStep: (val: {
    projectTitle: string;
    speaker: string;
    mic: string;
    corpus: { id: string; name: string };
    context?: string;
  }) => void;
}

export default function CorpusBasedFragment({
  invokeNextStep,
}: CorpusBasedFragmentProps) {
  const { t } = useTranslation("common");
  const { showMessage } = useSnackbar();
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedCorpus, setSelectedCorpus] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [projectTitle, setProjectTitle] = useState<string>("");
  const [speaker, setSpeaker] = useState<string>(""); //TODO
  const [context, setContext] = useState<string>("");
  const handleButtonClick = () => {
    if (
      !projectTitle ||
      projectTitle.length <= 0 ||
      !selectedMic ||
      selectedMic.length <= 0 ||
      !selectedCorpus || !speaker || speaker.length <= 0 //TODO remove this last one when Speaker has a dto instead of string
    ) {
      showMessage(t("pls_fill_all_fields"), 'error');
      return;
    }

    invokeNextStep({ projectTitle: projectTitle, speaker: speaker, mic: selectedMic, corpus: selectedCorpus, context: context });
  };

  //For dialog
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Request mic permissions first
    async function getMicrophones() {
      try {
        // Must ask for permission before enumerateDevices returns full info
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        setMics(audioInputs);
        if (audioInputs.length > 0) setSelectedMic(audioInputs[0].deviceId);
      } catch (err) {
        console.error(err);
        setError("Could not access microphones.");
      }
    }

    getMicrophones();
  }, []);
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
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ width: 200, fontWeight: 500 }}>
                {t("speaker")}:
              </Typography>
            </Grid>
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                placeholder={t("enter_speaker_name")}
                disabled
                value={speaker}
              />
            </Grid>
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ width: 200, fontWeight: 500 }}>
                {t("microphone")}:
              </Typography>
            </Grid>
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Select
                value={selectedMic}
                fullWidth
                onChange={(e) => setSelectedMic(e.target.value)}
              >
                <MenuItem value="" selected disabled>
                  {t("select_your_microphone")}
                </MenuItem>
                {mics.map((mic) => (
                  <MenuItem key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${mic.deviceId}`}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* TODO: only if we chose project type Nr. 1 */}
            {/* Corpus */}
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ width: 200, fontWeight: 500 }}>
                {t("corpus")}:{" "}
              </Typography>
            </Grid>
            <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                disabled
                fullWidth
                value={selectedCorpus?.name ?? t("select_a_corpus")}
              />
              <IconButton
                onClick={() => {
                  setOpen(true);
                }}
                color="primary"
              >
                <Search />
              </IconButton>
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

      <SelectCorpusDialog
        onSelect={(val) => {
          setSelectedCorpus(val);
        }}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
