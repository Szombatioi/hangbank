"use client";

import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

//TODO :)
export default function Home() {
  const router = useRouter();
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
    </div>
  );
}
