"use client";

import api from "@/app/axios";
import { CorpusBlockStatus } from "@/app/components/corpus_block_card";
import { DatasetType } from "@/app/my_datasets/overview/[id]/page";
import { CorpusBlockType } from "@/app/project/new/page";
import Recorder from "@/app/record/recorder copy";
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
import {
  Box,
  IconButton,
  Paper,
  Slider,
  Tooltip,
  Typography,
} from "@mui/material";
import { t } from "i18next";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface CorpusBlockWithText {
  corpusBlock: {
    id: string;
    sequence: number;
    //filename: string;
    status: CorpusBlockStatus;
    //corpus_block_minio_link: string;
    //corpus left out
  };
  text: string;
}

export default function RecordPage() {
  const params = useParams<{
    dataset_id: string; //this also conatins the mic that we need the permission to use
    block_index: string; //TODO: convert!!
  }>();
  const block_index = parseInt(params.block_index, 10);

  const [dataset, setDataset] = useState<DatasetType | null>(null);
  const [blocks, setBlocks] = useState<CorpusBlockWithText[] | null>(null);

  //To display the previous block texts
  const [previousBlockTexts, setPreviousBlockTexts] = useState<string[]>([]);
  //To display the following block texts
  const [followingBlockTexts, setFollowingBlockTexts] = useState<string[]>([]);

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

  const setup = async () => {
    //Get dataset
    const dataset = await api.get<DatasetType>(`/dataset/${params.dataset_id}`);
    console.log(dataset);
    setDataset(dataset.data);

    //Get [n-2, n+3] blocks
    console.log("Retrieving blocks around index:", currentBlockIndex);
    const fromIndex =
      currentBlockIndex - 2 < currentBlockIndex ? 0 : currentBlockIndex - 2;
    const toIndex =
      currentBlockIndex + 3 > dataset.data.corpusBlocks.length
        ? dataset.data.corpusBlocks.length
        : currentBlockIndex + 3;
    const blocks = await api.get<CorpusBlockWithText[]>(
      `/minio/blocks/${dataset.data.corpus.id}/${fromIndex}/${toIndex}`
    );
    console.log("Waaaaaa");
    console.log(blocks.data);
    setBlocks(blocks.data);

    //Set previous block texts
    const array: string[] = [];
    const prev_2: string | null =
      currentBlockIndex - 2 >= 0
        ? blocks.data[currentBlockIndex - 2].text
        : null; //TODO: and if > length?
    const prev_1: string | null =
      currentBlockIndex - 1 >= 0
        ? blocks.data[currentBlockIndex - 1].text
        : null;
    if (prev_2) array.push(prev_2);
    if (prev_1) array.push(prev_1);
    setPreviousBlockTexts(array);

    //Set following block texts
    const array2: string[] = [];
    const foll_1: string | null =
      currentBlockIndex + 1 < blocks.data.length
        ? blocks.data[currentBlockIndex + 1].text
        : null; //TODO: and if > length?
    const foll_2: string | null =
      currentBlockIndex + 2 < blocks.data.length
        ? blocks.data[currentBlockIndex + 2].text
        : null;
    if (foll_1) array2.push(foll_1);
    if (foll_2) array2.push(foll_2);
    setFollowingBlockTexts(array2);
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
                // border: "1px solid red",
                width: "75%",
                minHeight: 256,
                maxHeight: 512,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Paper
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "space-between",
                  padding: 4,
                  boxShadow: "none",
                  border: "2px solid #ccc",
                }}
                elevation={4}
              >
                <>
                {dataset && blocks && blocks.length > 0 && (
                  <>
                    {/* Previous blocks */}
                    {previousBlockTexts.length > 0 &&
                      previousBlockTexts.map((b, i) => (
                        <Typography
                          variant="h5"
                          align="center"
                          color="#888"
                          key={i}
                        >
                          {b}
                        </Typography>
                      ))}

                    <Typography
                      variant="h4"
                      align="center"
                      sx={{ fontWeight: 800 }}
                    >
                      {blocks[currentBlockIndex].text}
                    </Typography>

                    {/* Following blocks */}
                    {followingBlockTexts.length > 0 &&
                      followingBlockTexts.map((b, i) => (
                        <Typography
                          variant="h5"
                          align="center"
                          color="#888"
                          key={i}
                        >
                          {b}
                        </Typography>
                      ))}
                  </>
                )}
                </>

                <Typography
                  align="center"
                  sx={{
                    marginBottom: -4,
                    color: "#ccc",
                  }}
                >
                  {t("corpus")}
                </Typography>
              </Paper>
            </Box>
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
            {/* <div>
              <Tooltip title={t("record_block_again")}>
                <IconButton size="medium" sx={{ border: "1px solid red" }}>
                  <Undo />
                </IconButton>
              </Tooltip>
            </div> */}
            {/* <div>
              <Tooltip title={t("record_audio")}>
                <IconButton onClick={()=>{startRecording()}} size="large" sx={{ border: "1px solid red" }}>
                  <Mic />
                </IconButton>
                <IconButton size="large" sx={{ border: "1px solid red" }}>
                  <Mic />
                </IconButton>
              </Tooltip>
            </div> */}
            {/* <div>
              <Tooltip title={t("record_next_block")}>
                <IconButton size="medium" sx={{ border: "1px solid red" }}>
                  <Redo />
                </IconButton>
              </Tooltip>
            </div> */}
          </div>

          {/* {recordedAudioBlob && <>Blob ready !!!</>} */}
        </Paper>
      </Box>
    </>
  );
}
