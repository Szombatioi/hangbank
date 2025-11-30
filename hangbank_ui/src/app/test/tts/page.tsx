"use client";
import HighQualityRecorder from "@/app/components/recorder/high_quality_recorder";
import { Button, Typography } from "@mui/material";
import { useState } from "react";

export default function TestTTSPage() {
  const [transcript, setTranscript] = useState<string>("");
  
  return (
    <>
        {transcript.length > 0 && (<>
          <Typography variant="h4">
            {transcript}
          </Typography>
        </>)}
        <HighQualityRecorder 
          useTranscript={true}
          language="en-US"
          onSpacePress={() => {}}
          onTranscriptUpdate={(text: string) => {setTranscript(text)}}
          deviceId="06b13ea600dcbe5762bc2d1827cd2b7400d913e1db4616ce161f7d577c40e0be" 
          sampleRate={48000} />
    </>
  );
}
