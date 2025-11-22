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
import CorpusProjectOverview from "@/app/components/corpus_project_overview";

//TODO: add values to Textfields

interface CorpusResultType {
  projectTitle: string;
  speaker: SpeakerType;
  mic: string;
  corpus: { id: string; name: string, language: string };
  context?: string;
  speechDialect?: string | null;
  samplingFrequency: number;
}

export interface CorpusBlockType {
  id?: string; //not needed everywhere
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
  
  const { showMessage } = useSnackbar();

  const corpusBasedFinished = async (val: CorpusResultType) => {
    
    
    if (!val) {
      showMessage(t("internal_error"), Severity.error);
      return;
    }
    console.log("SpeechDialect: ", val.speechDialect);
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
    blocks.forEach((b) => b.status = 0);
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
                <ConvoBasedFragment invokeNextStep={function (val: {}): void {
                    throw new Error("Function not implemented.");
                  } } />
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
                  <CorpusProjectOverview 
                    projectTitle={corpusResult.projectTitle}
                    speakers={[corpusResult.speaker]}
                    corpus={corpusResult.corpus}
                    context={corpusResult.context}
                    speechDialect={corpusResult.speechDialect}
                    corpusBlocks={corpusBlocks} 
                    samplingFrequency={corpusResult.samplingFrequency}
                  />
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
