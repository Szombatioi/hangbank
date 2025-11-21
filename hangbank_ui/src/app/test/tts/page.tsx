"use client";
import HighQualityRecorder from "@/app/components/recorder/high_quality_recorder";
import { Button } from "@mui/material";

export default function TestTTSPage() {
  return (
    <>
        <HighQualityRecorder 
          useTranscript={true}
          language=""
          onSpacePress={() => {}}
          onTranscriptUpdate={() => {}}
          deviceId="06b13ea600dcbe5762bc2d1827cd2b7400d913e1db4616ce161f7d577c40e0be" 
          sampleRate={48000} />
    </>
  );
}
