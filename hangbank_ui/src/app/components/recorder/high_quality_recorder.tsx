"use client";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "@mui/material";
import { Mic, Stop } from "@mui/icons-material";
import WaveSurfer from "wavesurfer.js";

interface RecorderProps {
  sampleRate: number; // desired sample rate for recording
  deviceId: string;
  useTranscript: boolean;
  onSpacePress?: (blob: Blob) => void;
  onTranscriptUpdate?: (text: string) => void;
  language: string;
}

export default function HighQualityRecorder({
  deviceId,
  sampleRate,
}: RecorderProps) {
  const save_freq_ms = 500; //Updating wavesurf in every 0.5 sec
  const minPxPerSec = 100; //Width of waveform visual

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const waveSurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    waveSurferRef.current = WaveSurfer.create({
      container: "#waveform",
      waveColor: "#4F4A85",
      progressColor: "#383351",
      cursorColor: "#A6A3FF",
      barWidth: 2,
      height: 100,
      url: "",
      fillParent: false,
      minPxPerSec: minPxPerSec,
      autoScroll: true,
      autoCenter: true,
    });
    waveSurferRef.current.on("click", () => {
      waveSurferRef!.current!.play();
    });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
  
    if (isRecording) {
      interval = setInterval(() => {
        visualizePCM(pcmChunksRef.current);
      }, save_freq_ms);
    }
  
    return () => clearInterval(interval);
  }, [isRecording]);

  function visualizePCM(chunks: Float32Array[]) {
    if (!audioContextRef || !audioContextRef.current || !waveSurferRef.current) return;
  
    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.length;
    }
  
    waveSurferRef.current.loadBlob(encodeWavFromFloat32(merged, sampleRate));
  }
  

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (audioContextRef.current) audioContextRef.current.close();
      if (mediaStreamRef.current)
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startRecording = async () => {
    pcmChunksRef.current = [];
    setAudioUrl(null);

    // Create AudioContext with requested sample rate
    const audioContext = new AudioContext({ sampleRate });
    audioContextRef.current = audioContext;

    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
      },
    });
    mediaStreamRef.current = stream;

    // Add the audio worklet processor
    await audioContext.audioWorklet.addModule("/recorder-worklet.js");

    const source = audioContext.createMediaStreamSource(stream);
    const workletNode = new AudioWorkletNode(
      audioContext,
      "recorder-processor"
    );
    workletNodeRef.current = workletNode;

    // Listen for messages from the worklet (PCM chunks)
    workletNode.port.onmessage = (event) => {
      const chunk = event.data as Float32Array;
      pcmChunksRef.current.push(chunk);
    };

    source.connect(workletNode);
    workletNode.connect(audioContext.destination); // optional
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (
      !audioContextRef.current ||
      !workletNodeRef.current ||
      !mediaStreamRef.current
    )
      return;

    workletNodeRef.current.disconnect();
    mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    await audioContextRef.current.close();

    setIsRecording(false);

    // Merge PCM chunks
    const totalLength = pcmChunksRef.current.reduce(
      (sum, c) => sum + c.length,
      0
    );
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of pcmChunksRef.current) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to WAV
    const wavBlob = encodeWavFromFloat32(merged, sampleRate);
    setAudioUrl(URL.createObjectURL(wavBlob));
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <IconButton onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? <Stop /> : <Mic />}
      </IconButton>
      <div id="waveform" />

      {audioUrl && (
        <audio
          src={audioUrl}
          controls
          style={{ display: "block", marginTop: 10 }}
        />
      )}
    </div>
  );
}

// WAV encoder (16-bit PCM)
function encodeWavFromFloat32(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++)
      view.setUint8(offset + i, str.charCodeAt(i));
  }

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");

  // fmt sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // subchunk1size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s * 0x7fff, true);
  }

  return new Blob([new Uint8Array(buffer)], { type: "audio/wav" });
}
