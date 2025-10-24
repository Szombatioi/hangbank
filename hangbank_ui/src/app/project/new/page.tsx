"use client";
import SelectCorpusDialog from "@/app/components/dialogs/select_corpus_dialog";
import { AutoStories, Mic, Save, Search, SmartToy, Start } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { t } from "i18next";
import { useEffect, useState } from "react";
import CorpusBasedFragment, { SpeakerType } from "./corpus_based_fragment";
import ConvoBasedFragment from "./convo_based_fragment";
import CorpusBlockCard, {
  CorpusBlockStatus,
} from "@/app/components/corpus_block_card";
import api from "@/app/axios";
import { Severity, useSnackbar } from "@/app/contexts/SnackbarProvider";

//TODO: add values to Textfields

interface CorpusResultType {
  projectTitle: string;
  speaker: SpeakerType;
  mic: string;
  corpus: { id: string; name: string };
  context?: string;
}

interface CorpusBlockType {
  sequence: number;
  filename: string;
  status: CorpusBlockStatus;
}

export default function NewProjectPage() {
  const contentIdentifiers = ["types", "config", "overview"];
  const [active, setActive] = useState<"types" | "config" | "overview">(
    "types"
  );
  const [selectedMode, setSelectedMode] = useState<"corpus" | "convo" | null>(
    null
  );
  const [saveButtonDisabled, setSaveButtonDisabled] = useState<boolean>(false);
  const { showMessage } = useSnackbar();

  const saveProject = async () => {
    //TODO: handle convoResult too!!

    if(selectedMode === 'corpus'){
      if(!corpusResult) {
        showMessage("corpusResult error", Severity.error); //TODO show message
        return;
      }
  
      try{
        await api.post("/dataset",{
          projectName: corpusResult.projectTitle,
          microphone: corpusResult.mic,
          recordingContext: corpusResult.context,
          speaker_ids: [corpusResult.speaker.id],
          corpus_id: corpusResult.corpus.id
        });
        showMessage("project saved successfully", Severity.success); //TODO: message translation
        setSaveButtonDisabled(true);
      } catch(err){
        showMessage("error", Severity.error); //TODO error message translation
      }
    }
    // //---Corpus---
    // corpus_id: string;
    
  }

  const corpusBasedFinished = async (val: CorpusResultType) => {
    
    
    if (!val) {
      showMessage(t("internal_error"), Severity.error);
      return;
    }
    setCorpusResult(val);
    //Retrieve corpus blocks
    const cblocks = await api.get<CorpusBlockType[]>(
      `/corpus/${val.corpus.id}/blocks`
    );

    if (!cblocks.status.toString().startsWith("2")) {
      showMessage(t("corpus_blocks_retrieve_error"), Severity.error);
      return;
    }
    const blocks = cblocks.data.sort((a,b) => a.sequence - b.sequence);
    setCorpusBlocks(blocks);

    setActive("overview");
  };

  //Result of 2nd config step of Mode 1 (Corpus based)
  const [corpusResult, setCorpusResult] = useState<CorpusResultType | null>(
    null
  );
  const [corpusBlocks, setCorpusBlocks] = useState<
    CorpusBlockType[]
  >([]);

  return (
    <div className="relative w-full flex justify-center items-center">
      <AnimatePresence mode="wait">
        {active === "types" && (
          <motion.div
            initial={{ opacity: 0, y: 100 }} // Start below
            animate={{ opacity: 1, y: 0 }} // Swim upward
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center h-screen w-screen"
            style={{
              height: "100vh",
              width: "100vw",
            }}
          >
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "row",
                gap: 64,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                onClick={() => {
                  setSelectedMode("corpus");
                  setActive("config");
                }}
                style={{
                  border: "4px solid lightgrey",
                  borderRadius: 8,
                  width: 200,
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <AutoStories fontSize="large" />
                Corpus based
              </Button>
              <Button
                disabled //TODO enable once ready
                onClick={() => {
                  setSelectedMode("convo");
                  setActive("config");
                }}
                style={{
                  border: "4px solid lightgrey",
                  borderRadius: 8,
                  width: 200,
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <SmartToy fontSize="large" />
                Conversation based
              </Button>
            </div>
          </motion.div>
        )}

        {active === "config" && (
          <motion.div
            key="comp2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="absolute"
          >
            {selectedMode === "corpus" ? (
              <>
                <CorpusBasedFragment
                  invokeNextStep={(val) => {
                    corpusBasedFinished(val);
                  }}
                />
              </>
            ) : (
              <>
                <ConvoBasedFragment />
              </>
            )}
          </motion.div>
        )}
        {active === "overview" && (
          <>
            {corpusResult ? (
              <>
                <motion.div
                  key="comp3"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5 }}
                  className="absolute"
                >
                  <Box m={8} sx={{ display: "flex", justifyContent: "center" }}>
                    <Paper elevation={3} sx={{ width: "65%", padding: 4 }}>
                      <div style={{ margin: 8 }}>
                        {/* Result of previos (config) step */}
                        <Typography variant="h4" align="center">
                          {t("overview")}
                        </Typography>
                        <Typography>
                          {t("project")}: {corpusResult.projectTitle}
                        </Typography>
                        <Typography>
                          {t("speaker")}: {corpusResult.speaker.name}
                        </Typography>{" "}
                        {/*TODO: speaker.name or ID */}
                        <Typography>
                          {t("microphone")}: {corpusResult.mic}
                        </Typography>
                        <Typography>
                          {t("corpus")}: {corpusResult.corpus.name}
                        </Typography>
                        {corpusResult.context && (
                          <Typography>
                            {t("recording_context")}: {corpusResult.context}
                          </Typography>
                        )}
                      </div>
                      {/* Button to start recording from the first non-finished block */}
                      <div
                        style={{
                          margin: 12,
                          display: "flex",
                          justifyContent: "center",
                          gap: 4
                        }}
                      >
                        <Button variant="contained" endIcon={<Mic />}>{t("start")}</Button>
                        <Button disabled={saveButtonDisabled} onClick={()=>{saveProject()}} variant="contained" endIcon={<Save />}>{t("save")}</Button>
                      </div>

                      {/* TODO: Add corpus blocks here */}
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
                </motion.div>
              </>
            ) : (
              <>{/* TODO: Convo based results */}</>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
