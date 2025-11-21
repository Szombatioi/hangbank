"use client";
import { useEffect, useRef, useState } from "react";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import {
  Mic,
  Pause,
  PlayArrow,
  SettingsVoice,
  Stop,
} from "@mui/icons-material";
import WaveSurfer from "wavesurfer.js";
import { t } from "i18next";

interface RecorderProps {
  sampleRate: number; // desired sample rate for recording
  deviceId: string;
  useTranscript: boolean;
  onSpacePress?: (blob: Blob) => void;
  onTranscriptUpdate?: (text: string) => void;
  onRecorderStop?: (blob: Blob) => void;
  language: string;
}

export default function HighQualityRecorder({
  useTranscript,
  onSpacePress,
  onTranscriptUpdate,
  onRecorderStop,
  deviceId,
  sampleRate,
  language,
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
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const toggleAudioPlay = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  //WebSpeechAPI transcript
  const [wsi_transcript, setWsiTranscript] = useState(""); //Wsi transcript = Web Speech API transcript, which can restart if we are silent for too long
  const wsiTranscriptRef = useRef(wsi_transcript);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecordingRef = useRef(false);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  //Start/Stop playing audio with WaveSurfer when isPlayingAudio changes
  useEffect(() => {
    const ws = waveSurferRef.current;
    if (!ws) return;

    if (isPlayingAudio) {
      ws.play();
    } else {
      ws.pause();
    }
  }, [isPlayingAudio]);

  //Init SpeechRecognition
  useEffect(() => {
    if (!useTranscript) return;
    // console.log("Transcribe is enabled");

    if (typeof window === "undefined") return; // ensure client-side
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("SpeechRecognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // keep listening
    recognition.interimResults = true; // get partial results
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      //Only transcribe if recording and not paused
      // console.log(isRecordingRef.current, isPausedRef.current);
      if (!isRecordingRef.current) return;
      let final = ""; // Lezárt, végleges szöveg az aktuális eseményben
      let interim = ""; // Ideiglenes, még változó szöveg

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPart;
        } else {
          interim += transcriptPart;
        }
      }

      // 1. Frissítjük a FŐ (lezárt) transcript állapotot:
      if (final.length > 0) {
        // Hozzáadjuk a végleges szöveget a korábbi végleges szöveghez
        setTranscript((prev) => (prev.trim() + " " + final.trim()).trim());
      }

      // 2. A Webspeech API által adott teljes (lezárt + ideiglenes) szöveget tároljuk a WSI state-ben
      // Ezt jelenítheted meg a dobozban, mint a pillanatnyi szöveget.
      // Mivel az event.results már tartalmazza az interim részt, csak ezt kell beállítani:
      setWsiTranscript(interim);
    };

    recognition.onerror = (err: any) =>
      console.error("Recognition error:", err);

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    // console.log("onTranscriptUpdate: ", transcript, wsiTranscriptRef.current)
    if (onTranscriptUpdate) {
      onTranscriptUpdate(transcript + wsi_transcript);
    }
  }, [transcript, wsi_transcript]);

  const startTranscribe = () => {
    if (useTranscript && recognitionRef.current) {
      // 💡 JAVÍTÁS: A start() hívást try...catch blokkba tesszük
      try {
        recognitionRef.current.start();
        // console.log("Transcribe started in startTranscribe function");
      } catch (error: any) {
        // Ha már fut, az "InvalidStateError" hibát kapjuk,
        // amit egyszerűen figyelmen kívül hagyunk.
        if (error.name === "InvalidStateError") {
          console.warn(
            "SpeechRecognition already started, ignoring redundant call."
          );
        } else {
          // Más hiba esetén jelezzük
          console.error("SpeechRecognition start error:", error);
        }
      }
    }
  };

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
    if (!audioContextRef || !audioContextRef.current || !waveSurferRef.current)
      return;

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

    if (useTranscript) {
      startTranscribe();
    }
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
    if (useTranscript) recognitionRef.current?.stop();
    setTranscript("");
    setWsiTranscript("");

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

    let sentBlob = false;
    if (onSpacePress) {
      console.log("OnSpacePress pressed in recorder");
      onSpacePress(wavBlob); //send it back
      sentBlob = true;
    }
    if (onRecorderStop && !sentBlob) {
      onRecorderStop(wavBlob); //send final back, but ignore if space already sent it
    }
  };

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (onSpacePress && event.code === "Space" && isRecordingRef.current) {
        event.preventDefault(); // Megakadályozza az oldal görgetését

        console.log(
          "Spacebar: Blokkváltás. Jelenlegi Blob mentése és nullázása."
        );

        //Send currently recorded blob to caller side
        if (onSpacePress != null) {
          await stopRecording();
          await startRecording();
          console.log("Előző blokk Blob-ja elküldve.");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSpacePress]);

  return (
    <div
      style={{
        justifySelf: "center",
        // border: "1px solid red",
        width: "75%",
        overflowX: "auto",
        overflowY: "hidden",
        whiteSpace: "nowrap",
        marginTop: 8,
        marginBottom: 8,
      }}
    >
      {/* <IconButton onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? <Stop /> : <Mic />}
      </IconButton> */}

      <Paper
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 4,
          boxShadow: "none",
          border: "2px solid #ccc",
        }}
        elevation={4}
      >
        {/* Waveform */}
        <div id="waveform" />
        {/* Recording buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
          <IconButton
            onClick={() => {
              if (!isRecording) {
                startRecording();
              } else {
                stopRecording();
                //   if (isPaused) {
                //     resumeRecording();
                //   } else {
                //     pauseRecording();
                //   }
              }
            }}
            size="medium"
            sx={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)" }}
          >
            {/* {isRecording ? (
              // isPaused ? (
              //   <>
              //     <SettingsVoice />
              //   </>
              // ) : (
              //   <>
              //     <Pause />
              //   </>
              // )
              <Pause />
            ) : (
              <>
                
              </>
            )} */}
            {isRecording ? (
              <>
                <Stop />
              </>
            ) : (
              <>
                <Mic />
              </>
            )}
          </IconButton>

          {/* {isRecording && (
            <>
              <IconButton
                onClick={() => {
                  stopRecording();
                }}
                size="medium"
                sx={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)" }}
              >
                <Stop />
              </IconButton>
            </>
          )} */}

          {audioUrl && !isRecording && (
            <>
              <IconButton
                onClick={() => {
                  toggleAudioPlay();
                }}
                size="medium"
                sx={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)" }}
              >
                {isPlayingAudio ? <Pause /> : <PlayArrow />}
              </IconButton>
            </>
          )}

          {/* {audioUrl && !isRecording && (
            <>
              <IconButton
                onClick={() => {
                  toggleAudioPlay();
                }}
                size="medium"
                sx={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)" }}
              >
                {isPlayingAudio ? <Pause /> : <PlayArrow />}
              </IconButton>
            </>
          )} */}
        </div>
      </Paper>

      {/* {audioUrl && (
        <audio
          src={audioUrl}
          controls
          style={{ display: "block", marginTop: 10 }}
        />
      )} */}

      {useTranscript && (
        <>
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <Box
              sx={{
                justifySelf: "center",
                // border: "1px solid red",
                width: "100%",
                minHeight: 256,
                maxHeight: 512,
                display: "flex",
                justifyContent: "center",
                textWrap: "wrap",
              }}
            >
              <Paper
                sx={{
                  display: "flex",
                  width: "100%",
                  flexDirection: "column",
                  padding: 2,
                  boxShadow: "none",
                  border: "2px solid #ccc",
                  justifyContent: "space-between",
                  alignItems: "space-between",
                  textWrap: "wrap",
                }}
              >
                <Typography>{transcript + wsi_transcript}</Typography>

                <Typography
                  align="center"
                  sx={{
                    marginBlock: -2,
                    color: "#ccc",
                  }}
                >
                  {t("transcription")}
                </Typography>
              </Paper>
            </Box>
          </div>
        </>
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
