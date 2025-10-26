"use client";

import api from "@/app/axios";
import ProjectOverview, {
  CorpusHeaderType,
} from "@/app/components/project_overview";
import { SpeakerType } from "@/app/project/new/corpus_based_fragment";
import { CorpusBlockType } from "@/app/project/new/page";
import { CircularProgress } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export interface DatasetType {
  projectTitle: string;
  speakers: SpeakerType[];
  corpus: CorpusHeaderType;
  context?: string;
  corpusBlocks: CorpusBlockType[];
}

export default function OverviewPage() {
  const params = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<DatasetType | null>(null);
  useEffect(() => {
    async function fetchDataset(){
        try{
            const dataset_res = await api.get<DatasetType>(`/dataset/${params.id}`);
            console.log(dataset_res.data);
            setDataset(dataset_res.data);
        }catch(err){
            //TODO show message
        }
        
    }

    fetchDataset();
  }, []);
  return (
    <>
      {!params || !params.id || params.id == "undefined" ? (
        <>No ID provided{/* TODO: more error messages here*/}</>
      ) : (
        <>
          {!dataset ? (
            <>
              <CircularProgress />
            </>
          ) : (
            <>
              <ProjectOverview
                projectTitle={dataset.projectTitle}
                speakers={dataset.speakers}
                corpus={dataset.corpus}
                context={dataset.context}
                corpusBlocks={dataset.corpusBlocks}
                displaySaveButton={false}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
