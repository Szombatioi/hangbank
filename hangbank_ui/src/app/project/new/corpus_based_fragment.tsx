"use client";
import SelectCorpusDialog from "@/app/components/dialogs/select_corpus_dialog";
import { useSnackbar } from "@/app/contexts/SnackbarProvider";
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
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

//TODO: speaker is a dto, not string
export interface CorpusBasedFragmentProps {
  invokeNextStep: (val: {
    projectTitle: string;
    speaker: SpeakerType;
    mic: string;
    corpus: { id: string; name: string; language: string };
    context?: string;
    samplingFrequency: number;
  }) => void;
}

export interface SpeakerType {
  id: number;
  user: { id: string; name: string };
  mic: { deviceId: string; deviceLabel: string };
  samplingFrequency: number;
}

export default function CorpusBasedFragment({
  invokeNextStep,
}: CorpusBasedFragmentProps) {
  const { t } = useTranslation("common");
  const { data: session, status } = useSession();
  const { showMessage } = useSnackbar();
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [selectedFrequency, setSelectedFrequency] = useState<SampleRate>(22500);
  const [error, setError] = useState<string | null>(null);
  const [selectedCorpus, setSelectedCorpus] = useState<{
    id: string;
    name: string;
    language: string;
  } | null>(null);

  const [projectTitle, setProjectTitle] = useState<string>("");
  const [speaker, setSpeaker] = useState<SpeakerType | null>(null); //TODO
  const [context, setContext] = useState<string>("");
  const handleButtonClick = () => {
    if (
      !projectTitle ||
      projectTitle.length <= 0 ||
      !selectedMic ||
      selectedMic.length <= 0 ||
      !selectedCorpus ||
      !speaker ||
      !selectedFrequency
    ) {
      showMessage(t("pls_fill_all_fields"), "error");
      return;
    }

    const selectedMicName = mics.find((m) => m.deviceId === selectedMic)!.label;
    invokeNextStep({
      projectTitle: projectTitle,
      speaker: speaker,
      mic: selectedMicName,
      corpus: selectedCorpus,
      context: context,
      samplingFrequency: selectedFrequency,
    });
  };

  //For dialog
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function getMicrophones() {
      try {
        // Check permission status first
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        setMics(audioInputs);
        if (audioInputs.length > 0) {
          setSelectedMic(audioInputs[0].deviceId);
          //To fill Speaker input
          if (session?.user?.id && session.user.name) {
            setSpeaker({
              id: 0,
              user: { id: session.user.id, name: session.user.name },
              mic: {
                deviceId: audioInputs[0].deviceId,
                deviceLabel: audioInputs[0].label,
              },
              samplingFrequency: 0
            }); //TODO:
          }
        }

        stream.getTracks().forEach((track) => track.stop());

        // const permission = await navigator.permissions.query({ name: "microphone" as PermissionName });
        // if (permission.state === "denied") {
        //   setError("Microphone permission denied.");
        //   return;
        // }

        // // Enumerate devices (this may require user to allow mic once in the browser)
        // const devices = await navigator.mediaDevices.enumerateDevices();
        // const audioInputs = devices.filter((d) => d.kind === "audioinput");
        // setMics(audioInputs);
        // if (audioInputs.length > 0) setSelectedMic(audioInputs[0].deviceId);
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
                value={speaker ? speaker.user.name + " (You)" : ""}
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
                <MenuItem value="" disabled>
                  {t("select_your_microphone")}
                </MenuItem>
                {mics.map((mic) => (
                  <MenuItem key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${mic.deviceId}`}
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
