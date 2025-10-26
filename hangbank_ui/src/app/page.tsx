"use client";

import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import CorpusBlockCard, { CorpusBlockStatus } from "./components/corpus_block_card";

//TODO :)
export default function Home() {
  const router = useRouter();

  const blocks: {s: number, f: string, status: CorpusBlockStatus}[] = [
    {s: 1, f: "Filename-0001.txt", status: CorpusBlockStatus.done},
    {s: 2, f: "Filename-0002.txt", status: CorpusBlockStatus.warning},
    {s: 3, f: "Filename-0003.txt", status: CorpusBlockStatus.todo},
    {s: 4, f: "Filename-0004.txt", status: CorpusBlockStatus.todo},
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: 32 }}>
      Welcome
      <div>
        <Button
          variant="contained"
          onClick={() => {
            router.push("/corpus/upload");
          }}
        >
          Upload corpus example
        </Button>
      </div>
      <div>
        <Button
          variant="contained"
          onClick={() => {
            router.push("/project/new");
          }}
        >
          Create new project example
        </Button>
      </div>
      <div>
        <Button
          variant="contained"
          onClick={() => {
            router.push("/my_datasets");
          }}
        >
          View my datasets
        </Button>
      </div>
      {blocks.map((block, i) => (
        <CorpusBlockCard key={i} sequence={block.s} filename={block.f} status={block.status} />
      ))}
    </div>
  );
}
