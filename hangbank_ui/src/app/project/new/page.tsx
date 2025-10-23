"use client";
import SelectCorpusDialog from "@/app/components/dialogs/select_corpus_dialog";
import { AutoStories, Search, SmartToy } from "@mui/icons-material";
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
import CorpusBasedFragment from "./corpus_based_fragment";
import ConvoBasedFragment from "./convo_based_fragment";

//TODO: add values to Textfields

export default function NewProjectPage() {
  const contentIdentifiers = ["types", "config", "overview"];
  const [active, setActive] = useState<"types" | "config" | "overview">(
    "types"
  );
  const [selectedMode, setSelectedMode] = useState<"corpus" | "convo" | null>(
    null
  );

  //Result of 2nd config step of Mode 1 (Corpus based)
  const [corpusResult, setCorpusResult] = useState<{
    projectTitle: string;
    speaker: string;
    mic: string;
    corpus: { id: string; name: string };
    context?: string;
  } | null>(null);

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
                <CorpusBasedFragment invokeNextStep={(val) => {setCorpusResult(val); setActive('overview');}} />
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
                
            </>
        )}
      </AnimatePresence>
    </div>
  );
}
