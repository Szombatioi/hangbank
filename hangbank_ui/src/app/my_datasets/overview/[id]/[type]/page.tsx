"use client";

import api from "@/app/axios";
import ConvoProjectOverview from "@/app/components/convo_project_overview";
import CorpusProjectOverview, {
  CorpusHeaderType,
} from "@/app/components/corpus_project_overview";
import { Severity, useSnackbar } from "@/app/contexts/SnackbarProvider";
import { SpeakerType } from "@/app/project/new/corpus_based_fragment";
import { CorpusBlockType } from "@/app/project/new/page";
import { CircularProgress } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export interface AiModelType {
  name: string;
  model: string;
}

export interface DatasetCorpusType {
  id: string;
  projectTitle: string;
  speakers: SpeakerType[];
  context?: string;
  speechDialect?: string;
  corpus: CorpusHeaderType;
  corpusBlocks: CorpusBlockType[];
}

export interface DatasetConvoType {
  id: string,
  projectTitle: string,
        speakers: [
          {
            id: number,
            user: {
              id: string,
              name: string,
            },
            mic: {
              deviceId: string,
              deviceLabel: string,
            },
            samplingFrequency: number,
            speechDialect?: string | null,
          },
        ],
        context?: string | null,
        // speechDialect: dataset.metadata.speakers[0].speechDialect,
        aiChat: {
          aiChatHistory: {
            id: string,
            text: string,
            aiSent: boolean,
            createdAt: Date,
          }[],
          aiModel: {
            modelName: string,
            name: string,
          },
          topic: string,
        },

        language: {
          code: string,
          name: string,
        },
}

export default function OverviewPage() {
  const params = useParams<{ id: string; type: string }>();
  const [corpusDataset, setCorpusDataset] = useState<DatasetCorpusType | null>(
    null
  );
  const [convoDataset, setConvoDataset] = useState<DatasetConvoType | null>(
    null
  );
  const { showMessage } = useSnackbar();
  const { t } = useTranslation("common");
  useEffect(() => {
    if (!["convo", "corpus"].includes(params.type)) {
      showMessage(t("invalid_type"), Severity.error);
      return;
    }

    async function fetchDataset() {
      try {
        if (params.type === "corpus") {
          const dataset_res = await api.get<DatasetCorpusType>(
            `/dataset/${params.id}`
          );
          setCorpusDataset(dataset_res.data);
        } else {
          const dataset_res = await api.get<DatasetConvoType>(
            `/dataset/${params.id}`
          );
          setConvoDataset(dataset_res.data);
        }
      } catch (err) {
        //TODO show message
      }
    }

    fetchDataset();
  }, [params]);

  return (
    <>
      {!params || !params.id || params.id == "undefined" ? (
        <>No ID provided{/* TODO: more error messages here*/}</>
      ) : (
        <>
          {!corpusDataset && !convoDataset ? (
            <CircularProgress />
          ) : (
            <>
              {params.type === "corpus" && corpusDataset ? (
                <>
                  <CorpusProjectOverview
                    projectTitle={corpusDataset.projectTitle}
                    speakers={corpusDataset.speakers}
                    corpus={corpusDataset.corpus}
                    context={corpusDataset.context}
                    speechDialect={corpusDataset.speechDialect}
                    corpusBlocks={corpusDataset.corpusBlocks}
                    projectId={params.id}
                    samplingFrequency={
                      corpusDataset.speakers[0].samplingFrequency
                    }
                  />
                </>
              ) : (
                <>
                  <ConvoProjectOverview
                    projectId={convoDataset?.id}
                    title={convoDataset!.projectTitle}
                    aiModel={{
                      name: convoDataset!.aiChat.aiModel.name,
                      model: convoDataset!.aiChat.aiModel.modelName,
                    }}
                    language={{
                      code: convoDataset!.language.code,
                      name: convoDataset!.language.name,
                    }}
                    speaker={{
                      id: convoDataset!.speakers[0].user.id,
                      name: convoDataset!.speakers[0].user.name,
                    }}
                    microphone={{
                      deviceId: convoDataset!.speakers[0].mic.deviceId,
                      label: convoDataset!.speakers[0].mic.deviceLabel,
                    }}
                    samplingFrequency={
                      convoDataset!.speakers[0].samplingFrequency
                    }
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
