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
  Button,
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault(); // prevents scrolling the page
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
      currentBlockIndex + 3 > dataset.data.corpusBlocks.length - 1
        ? dataset.data.corpusBlocks.length - 1
        : currentBlockIndex + 3;
    console.log(dataset.data.corpusBlocks.length);
    console.log(currentBlockIndex);
    console.log(toIndex);
    const blocks = await api.get<CorpusBlockWithText[]>(
      `/minio/blocks/${dataset.data.corpus.id}/${fromIndex}/${toIndex}`
    );
    console.log("Waaaaaa");
    console.log(blocks.data);
    await setBlocks(blocks.data);
    setPrevFollowingBlocks(currentBlockIndex, blocks.data);
  };

  const setPrevFollowingBlocks = (
    index: number,
    blocks: CorpusBlockWithText[]
  ) => {
    //Set previous block texts
    const array: string[] = [];
    //Previous by 2 indecies
    const prev_2: string | null =
      index - 2 >= 0 ? blocks[index - 2].text : null; //TODO: and if > length?
    const prev_1: string | null =
      index - 1 >= 0 ? blocks[index - 1].text : null;
    if (prev_2) array.push(prev_2);
    if (prev_1) array.push(prev_1);
    setPreviousBlockTexts(array);

    //Set following block texts
    const array2: string[] = [];
    const foll_1: string | null =
      index + 1 < blocks.length ? blocks[index + 1].text : null; //TODO: and if > length?
    const foll_2: string | null =
      index + 2 < blocks.length ? blocks[index + 2].text : null;
    if (foll_1) array2.push(foll_1);
    if (foll_2) array2.push(foll_2);
    setFollowingBlockTexts(array2);
  };

  const datasetRef = useRef<DatasetType | null>(null);
  const blocksRef = useRef<CorpusBlockWithText[] | null>(null);
  const currentBlockIndexRef = useRef<number>(block_index);
  useEffect(() => {
    datasetRef.current = dataset;
  }, [dataset]);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);
  useEffect(() => {
    currentBlockIndexRef.current = currentBlockIndex;
  }, [currentBlockIndex]);

  const nextBlock = async () => {
    const dataset = datasetRef.current;
    const blocks = blocksRef.current;
    let currentIndex = currentBlockIndexRef.current;

    if (!dataset || !blocks) {
      console.log("!dataset || !blocks");
      console.log("Dataset: ", dataset);
      console.log("Blocks: ", blocks);
      return;
    }
    if (currentIndex + 1 >= dataset!.corpusBlocks!.length) {
      console.log("currentIndex + 1 >= dataset!.corpusBlocks!.length");
      return;
    }

    //TODO: assign this Blob to the curpus block before moving on

    const newIndex = currentIndex + 1;
    currentBlockIndexRef.current = newIndex;
    setCurrentBlockIndex(newIndex);

    const blocksNeeded = newIndex + 3;
    if (
      blocksNeeded >= blocks.length &&
      blocks.length < dataset.corpusBlocks.length
    ) {
      const fromNewIndex = blocks.length;
      const toNewIndex = Math.min(
        fromNewIndex + 3,
        dataset.corpusBlocks.length - 1
      );

      try {
        const res = await api.get<CorpusBlockWithText[]>(
          `/minio/blocks/${dataset.corpus.id}/${fromNewIndex}/${toNewIndex}`
        );
        const newBlocks = [...blocks, ...res.data];
        blocksRef.current = newBlocks;
        setBlocks(newBlocks);

        // Update previous/following arrays
        setPrevFollowingBlocks(newIndex, newBlocks);
      } catch (error) {
        console.error("Failed to fetch more blocks:", error);
      }
    } else {
      setPrevFollowingBlocks(newIndex, blocks);
    }

    //Update the previous and following blocks
    //If we have no blocks in the buffer, load more
  };

  useEffect(() => {
    setup();
  }, []);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Paper elevation={3} sx={{ width: "85%", padding: 2 }}>
          {/* Part 1: Corpus block viewer */}
          <div style={{ marginTop: 8, marginBottom: 8, width: "100%" }}>
            <Box
              sx={{
                justifySelf: "center",
                // border: "1px solid red",
                width: "100%",
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
              onSpacePress={nextBlock}
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
          <Button onClick={nextBlock} variant="contained" endIcon={<Mic />}>
            next
          </Button>
        </Paper>
      </Box>
    </>
  );
}
