"use client";

import api from "@/app/axios";
import { CorpusBlockStatus } from "@/app/components/corpus_block_card";
import HighQualityRecorder from "@/app/components/recorder/high_quality_recorder";
import { Severity, useSnackbar } from "@/app/contexts/SnackbarProvider";
import { DatasetCorpusType } from "@/app/my_datasets/overview/[id]/[type]/page";
import { CorpusBlockType } from "@/app/project/new/page";
import Recorder from "@/app/record/recorder copy";
import {
  Mic,
  Pause,
  PlayArrow,
  Redo,
  RestartAlt,
  Save,
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
  Toolbar,
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

interface SaveableAudioBlock {
  blob: Blob;
  corpusBlockId: string;
}

export default function RecordPage() {
  const params = useParams<{
    dataset_id: string; //this also conatins the mic that we need the permission to use
    block_index: string; //TODO: convert!!
  }>();
  const block_index = parseInt(params.block_index, 10);
  const { showMessage } = useSnackbar();

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

  const [dataset, setDataset] = useState<DatasetCorpusType | null>(null);
  const [blocks, setBlocks] = useState<CorpusBlockWithText[] | null>(null);
  const saveableAudioBlocksRef = useRef<SaveableAudioBlock[]>([]);

  //Save audioBlocks that were recorded
  const saveProgress = async () => {
    console.log("Save progress: ", saveableAudioBlocksRef.current);
    //corpusBlockId, datasetId, speakerId, and the Blob as File form
    if (!datasetRef || !datasetRef.current) {
      console.log("Could not save progress");
      showMessage(t("could_not_save_progress"), Severity.error);
      return;
    }

    const tasks = [];
    const errors: string[] = [];
    console.log(saveableAudioBlocksRef.current);
    saveableAudioBlocksRef.current.forEach((a) => {
      console.log("Blob ", a.corpusBlockId);
      const formData = new FormData();
      formData.append("file", a.blob); //Blob is a .wav blob
      formData.append("datasetId", datasetRef!.current!.id);
      formData.append(
        "speakerId",
        datasetRef.current!.speakers[0].id.toString()
      ); //datasetRef!.current!.speakers[0].id);
      formData.append("corpusBlockId", a.corpusBlockId);
      const task = api
        .post("/audio-block", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .catch((e) => {
          errors.push(e);
        });

      tasks.push(task);
    });

    console.log("Any errors?");
    if (errors.length > 0) {
      showMessage(`${t("errors_occured")}: ${errors.join("\n")}`);
    }
  };

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

  //When you press space -> add to list and go to next block (handle it in onSpace method)
  //When you stop the recording -> get the last blob
  const addAudioBlobToList = (blob: Blob) => {
    saveableAudioBlocksRef.current.push({
      blob: blob,
      corpusBlockId:
        blocksRef.current![currentBlockIndexRef.current].corpusBlock.id,
    });

    console.log(saveableAudioBlocksRef.current);
  };

  const setup = async () => {
    //Get dataset
    const dataset = await api.get<DatasetCorpusType>(`/dataset/${params.dataset_id}`);
    setDataset(dataset.data);
    console.log("currentBlockIndex: ", currentBlockIndex);
    //Get [n-2, n+3] blocks
    const fromIndex = currentBlockIndex - 2 < 0 ? 0 : currentBlockIndex - 2;

    const toIndex =
      currentBlockIndex + 3 > dataset.data.corpusBlocks.length - 1
        ? dataset.data.corpusBlocks.length - 1
        : currentBlockIndex + 3;
    console.log("fromIndex ", fromIndex);
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

  const datasetRef = useRef<DatasetCorpusType | null>(null);
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

  const getAudioBlob = (blob: Blob) => {
    console.log("Getting audio blob from recorder");
    console.log("Blocks: ", blocks);
    console.log("CurrentBlockIndex: ", currentBlockIndex);
    saveableAudioBlocksRef.current.push({
      blob: blob,
      corpusBlockId:
        blocksRef.current![currentBlockIndexRef.current].corpusBlock.id,
    });

    console.log(
      "saveableAudioBlocksRef.current: ",
      saveableAudioBlocksRef.current
    );
  };

  const prevBlock = async () => {
    const dataset = datasetRef.current;
    const blocks = blocksRef.current;
    let currentIndex = currentBlockIndexRef.current;

    if (!dataset || !blocks) {
      return;
    }
    if (currentIndex - 1 < 0) {
      return;
    }

    // console.log("CurrentIndex: ", currentIndex);
    var newIndex = currentIndex - 1;
    currentBlockIndexRef.current = newIndex;
    setCurrentBlockIndex(newIndex);
    // console.log("NewIndex before if: ", newIndex);
    //Fetch new blocks
    if (newIndex <= 0 && blocks[0].corpusBlock.sequence !== 1) {
      const fromNewIndex = Math.max(blocks[0].corpusBlock.sequence - 4, 0);
      const toNewIndex = blocks[0].corpusBlock.sequence - 2;
      try {
        const res = await api.get<CorpusBlockWithText[]>(
          `/minio/blocks/${dataset.corpus.id}/${fromNewIndex}/${toNewIndex}`
        );
        // console.log(blocks);
        newIndex = blocks[0].corpusBlock.sequence - 1;
        currentBlockIndexRef.current = newIndex;
        setCurrentBlockIndex(newIndex);
        // console.log(newIndex);
        const newBlocks = [...res.data, ...blocks];
        blocksRef.current = newBlocks;
        // console.log(newBlocks);
        setBlocks(newBlocks);

        // Update previous/following arrays
        setPrevFollowingBlocks(newIndex, newBlocks);
      } catch (error) {
        console.error("Failed to fetch more blocks:", error);
      }
    } else {
      setPrevFollowingBlocks(newIndex, blocks);
    }
  };

  const nextBlock = async () => {
    // getAudioBlob(blob);

    const dataset = datasetRef.current;
    const blocks = blocksRef.current;
    let currentIndex = currentBlockIndexRef.current;

    if (!dataset || !blocks) {
      // console.log("!dataset || !blocks");
      // console.log("Dataset: ", dataset);
      // console.log("Blocks: ", blocks);
      return;
    }
    if (currentIndex + 1 >= dataset!.corpusBlocks!.length) {
      console.log("currentIndex + 1 >= dataset!.corpusBlocks!.length");
      return;
    }

    //TODO: assign this Blob to the curpus block before moving on
    //How to save the audioBlock?
    //Save the audioBlock to saveableBlocks
    //then just call api creation for AudioBlock

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
          {/* Title and save button */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div></div>
            <Typography variant="h3" align="center">
              {t("dataset")}: {dataset?.projectTitle}
            </Typography>
            <Tooltip title={t("save")}>
              <IconButton onClick={() => saveProgress()}>
                <Save />
              </IconButton>
            </Tooltip>
          </div>

          {/* Part 1: Corpus block viewer */}
          <div
            style={{
              marginTop: 8,
              marginBottom: 8,
              width: "100%",
              display: "flex",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tooltip title={t("prev_block")}>
                <IconButton onClick={prevBlock}>
                  <Undo />
                </IconButton>
              </Tooltip>
            </div>

            {/* Corpus viewer paper */}
            <Box
              sx={{
                justifySelf: "center",
                // border: "1px solid red",
                flexGrow: 1,
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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tooltip title={t("next_block")}>
                <IconButton onClick={nextBlock}>
                  <Redo />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {/* Part 2: Waveform of audio */}
          {/* TODO: set freq based on corpus setting (not save_freq_ms, this is just my preference) */}
          {dataset && (
            <HighQualityRecorder
              sampleRate={dataset.speakers[0].samplingFrequency}
              deviceId={dataset.speakers[0].mic.deviceId}
              useTranscript={true}
              onSpacePress={(blob: Blob) => {
                addAudioBlobToList(blob);
                nextBlock();
              }}
              onTranscriptUpdate={() => {}}
              onRecorderStop={(blob: Blob) => {
                addAudioBlobToList(blob);
              }}
              language={dataset.corpus.language}
            />
            // <Recorder
            //   selectedDeviceId={dataset.speakers[0].mic.deviceId}
            //   save_freq_ms={250}
            //   useTranscript={true}
            //   onAudioUpdate={handleAudioUrlUpdate}
            //   onRecordingStop={handleAudioBlobUpdate}
            //   onSpacePress={nextBlock}
            //   language={dataset.corpus.language}
            //   sampleRate={dataset.speakers[0].samplingFrequency}
            // />
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
          {/* <Button onClick={() => nextBlock()} variant="contained" endIcon={<Mic />}>
            next
          </Button> */}
        </Paper>
      </Box>
    </>
  );
}
