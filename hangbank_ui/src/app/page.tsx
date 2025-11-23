"use client";

import { Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import CorpusBlockCard, {
  CorpusBlockStatus,
} from "./components/corpus_block_card";
import ChatBubble from "./components/chat-bubble";

//TODO :)
export default function Home() {
  const router = useRouter();
  return (
    <>
      <Typography variant="h4" align="center">
        Welcome
      </Typography>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          margin: 32,
        }}
      >
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
      </div>
    </>
  );
}
