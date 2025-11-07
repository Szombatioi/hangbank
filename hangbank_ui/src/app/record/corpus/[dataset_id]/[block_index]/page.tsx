"use client";

import api from "@/app/axios";
import { DatasetType } from "@/app/my_datasets/overview/[id]/page";
import Recorder from "@/app/record/recorder";
import {
  Mic,
  Pause,
  PlayArrow,
  Redo,
  RestartAlt,
  SkipNext,
  SkipPrevious,
  Stop,
  Undo,
  ZoomIn,
  ZoomOut,
} from "@mui/icons-material";
import { Box, IconButton, Paper, Slider, Tooltip } from "@mui/material";
import { t } from "i18next";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export default function RecordPage() {
  const params = useParams<{
    dataset_id: string; //this also conatins the mic that we need the permission to use
    block_index: string; //TODO: convert!!
  }>();
  const block_index = parseInt(params.block_index, 10);

  const [dataset, setDataset] = useState<DatasetType | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] =
    useState<number>(block_index);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null); //the currently recorded block's audio URL
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null); //the currently recorded block's audio Blob

  const handleAudioUrlUpdate = (url: string) => {
    setRecordedAudioUrl(url);
  };

  const handleAudioBlobUpdate = (blob: Blob) => {
    setRecordedAudioBlob(blob);
  };

  // const [isRecording, setIsRecording] = useState(false);
  // const [audioURL, setAudioURL] = useState<string | null>(null);
  // const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // const audioChunksRef = useRef<Blob[]>([]);

  const setup = async () => {
    //Get dataset
    const dataset = await api.get<DatasetType>(`/dataset/${params.dataset_id}`);
    console.log(dataset);
    setDataset(dataset.data);

    //Get mic that is saved as device in the metadata
    // let mics = []
    // try {
    //     await navigator.mediaDevices.getUserMedia({ audio: true });

    //     const devices = await navigator.mediaDevices.enumerateDevices();
    //     mics = devices.filter(device => device.kind === 'audioinput');
    //   } catch (err) {
    //     // console.error("Hiba a mikrofonok lekérésekor vagy engedély megtagadása: ", err);
    //     return [];
    //   }

    //   //TOD O folyt innen!
    //   const selectedDevice = mics.find((m) => m.label === dataset.data.speakers[0].mic.deviceId);
    //   if (!selectedDevice) console.error("Could not find the desired mic");

    //   const constraints = {
    //     audio: { deviceId: selectedDevice ? { exact: selectedDevice.deviceId } : undefined }
    //   };
    //   const stream = await navigator.mediaDevices.getUserMedia(constraints);
  };

  useEffect(() => {
    setup();
  }, []);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Paper elevation={3} sx={{ width: "85%" }}>
          {/* Part 1: Corpus block viewer */}
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <Box
              sx={{
                justifySelf: "center",
                border: "1px solid red",
                width: "75%",
                minHeight: 256,
                maxHeight: 512,
              }}
            ></Box>
          </div>

          {/* Part 2: Waveform of audio */}
          {/* TODO: set freq based on corpus setting (not save_freq_ms, this is just my preference) */}
          {dataset && (
            <Recorder
              selectedDeviceId={dataset.speakers[0].mic.deviceId}
              save_freq_ms={1000}
              useTranscript={true}
              onAudioUpdate={handleAudioUrlUpdate}
              onRecordingStop={handleAudioBlobUpdate}
            />
          )}

          {/* Part 3: Buttons */}
          <div
            style={{
              justifySelf: "center",
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            <div>
              <Tooltip title={t("record_block_again")}>
                <IconButton size="medium" sx={{ border: "1px solid red" }}>
                  <Undo />
                </IconButton>
              </Tooltip>
            </div>
            <div>
              <Tooltip title={t("record_audio")}>
                {/* <IconButton onClick={()=>{startRecording()}} size="large" sx={{ border: "1px solid red" }}>
                  <Mic />
                </IconButton> */}
                <IconButton size="large" sx={{ border: "1px solid red" }}>
                  <Mic />
                </IconButton>
              </Tooltip>
            </div>
            <div>
              <Tooltip title={t("record_next_block")}>
                <IconButton size="medium" sx={{ border: "1px solid red" }}>
                  <Redo />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {recordedAudioBlob && <>Blob ready !!!</>}
        </Paper>
      </Box>
    </>
  );
}
