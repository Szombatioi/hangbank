"use client";
//TODO: handle space key to go next block
import {
  ZoomOut,
  RestartAlt,
  Pause,
  PlayArrow,
  ZoomIn,
  Mic,
  Stop,
  SettingsVoice,
} from "@mui/icons-material";
import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import WaveSurfer from "wavesurfer.js";

interface RecorderProps {
  selectedDeviceId: string | null;
  save_freq_ms: number;
  useTranscript: boolean;
  onAudioUpdate?: (url: string) => void;
  onRecordingStop: (finalBlob: Blob) => void;
}

export default function Recorder({
  selectedDeviceId,
  save_freq_ms,
  useTranscript,
  onAudioUpdate,
  onRecordingStop,
}: RecorderProps) {
  const { t } = useTranslation("common");

  const [stream, setStream] = useState<MediaStream | null>(null); //represents the microphone
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null); //represents the recording process
  const [isRecording, setIsRecording] = useState<boolean>(false); //whether we are recording or not
  const [isPaused, setIsPaused] = useState<boolean>(false); //whether we are paused or not
  const isRecordingRef = useRef(isRecording);
  const isPausedRef = useRef(isPaused);
  const [audioUrl, setAudioUrl] = useState<string | null>(null); //the recorded audio URL to represent as waveform and to play
  const audioChunksRef = useRef<Blob[]>([]); //to store the recorded audio chunks

  //WebSpeechAPI transcript
  const [wsi_transcript, setWsiTranscript] = useState(""); //Wsi transcript = Web Speech API transcript, which can restart if we are silent for too long
  const wsiTranscriptRef = useRef(wsi_transcript);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Minden rendereléskor szinkronizálja a Ref-eket a State-tel
  useEffect(() => {
    isRecordingRef.current = isRecording;
    isPausedRef.current = isPaused;
    wsiTranscriptRef.current = wsi_transcript;
  }, [isRecording, isPaused, wsi_transcript]);

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
    recognition.lang = "en-US"; //TODO set by Dataset language

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      //Only transcribe if recording and not paused
      // console.log(isRecordingRef.current, isPausedRef.current);
      if (!isRecordingRef.current || isPausedRef.current) return;

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

  const startTranscribe = () => {
    if (useTranscript) {
      recognitionRef.current?.start();
      // console.log("Transcribe started in startTranscribe function");
    }
  };
  const stopTranscribe = () => {
    if (useTranscript) recognitionRef.current?.stop();
  };

  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const toggleAudioPlay = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

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

  //TODO: make this number adjusted based on the audio length
  const [minPxPerSec, setMinPxPerSec] = useState<number>(15); //1-1000?
  const handleSliderChange = (event: Event, newValue: number) => {
    setMinPxPerSec(newValue);
  };

  //Update zoom level when minPxPerSec changes
  useEffect(() => {
    if (waveSurferRef.current) {
      waveSurferRef.current.zoom(minPxPerSec);
    }
  }, [minPxPerSec]);

  //Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    // Create wavesurfer only once
    waveSurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
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
      setIsPlayingAudio(true);
      waveSurferRef!.current!.play();
    });

    // console.log(isPlayingAudio);

    return () => {
      waveSurferRef.current?.destroy();
      waveSurferRef.current = null;
    };
  }, []);

  //Update waveform if there is a new audio URL (every 1 sec)
  useEffect(() => {
    const ws = waveSurferRef.current;
    if (ws && audioUrl) {
      // Töröljük a régi URL-t, mielőtt újat töltünk be
      if (ws.isPlaying()) {
        ws.pause();
        setIsPlayingAudio(false);
      }

      // Betöltjük az újonnan generált Blob URL-t
      ws.load(audioUrl).catch((err) =>
        console.error("WaveSurfer hiba a betöltéskor:", err)
      );

      // Nagyon fontos: felszabadítjuk a régi Blob URL-t
      // (Bár a setAudioUrl az új URL-t kapja, a régi már nem kell, ha nem mentjük el)
      // Ezt a cleanup-ban célszerűbb megoldani.
    }
  }, [audioUrl]);

  //Function to get microphone stream and setup recorder
  const getStreamAndSetupRecorder = async () => {
    //Stream already exists
    if (stream) {
      return;
    }

    try {
      const constraints = {
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        },
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      const newRecorder = new MediaRecorder(newStream, {
        mimeType: "audio/webm; codecs=opus",
      });
      setRecorder(newRecorder);

      // A 'dataavailable' eseménykezelő beállítása a folyamatos Blob mentéshez
      newRecorder.ondataavailable = (event) => {
        // Csak akkor dolgozzuk fel, ha van adat
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);

          //Set the audio URL for playback and visualization
          const fullBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          const newUrl = URL.createObjectURL(fullBlob);
          setAudioUrl(newUrl);

          if (onAudioUpdate) {
            onAudioUpdate(newUrl);
          }
        }
      };

      newRecorder.onstop = () => {
        newStream?.getTracks().forEach((track) => track.stop());

        //Final blob
        if (audioChunksRef.current.length > 0) {
          const finalBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          onRecordingStop(finalBlob);
          // console.log("Felvétel sikeresen lezárva. Végleges Blob átadva.");
        } else {
          // Ez a helyzet akkor állhat elő, ha túl gyorsan nyomták meg a stop-ot
          // console.warn("Rögzítés leállítva, de nincs rögzített adat.");
        }

        // Állapotok nullázása
        audioChunksRef.current = [];
        setStream(null);
        setRecorder(null);
        // Az isRecording és isPaused már a stopRecording-ban frissült
      };

      //We start the recording here because setXYZ is async and we want to start right away
      newRecorder.start(save_freq_ms);
      // console.log("Recording started");
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      alert(t("no_mic_access"));
      throw new Error();
    }
  };

  const getAudioBlobAndUrl = () => {
    const currentFullBlob = new Blob(audioChunksRef.current, {
      type: "audio/webm",
    });

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const newUrl = URL.createObjectURL(currentFullBlob);
    setAudioUrl(newUrl);
  };

  const startRecording = async () => {
    if (isRecording) return;

    audioChunksRef.current = [];
    setAudioUrl(null);
    setTranscript("");
    setWsiTranscript("");

    try {
      await getStreamAndSetupRecorder();
      startTranscribe();
      // if (recorder && stream) {
      //   recorder!.start(save_freq_ms);
      //   setIsPaused(false);
      //   setIsRecording(true);
      // }
    } catch (err) {
      alert(t("no_mic_access"));
    }
  };

  const pauseRecording = () => {
    if (recorder && isRecording && !isPaused) {
      recorder!.pause();
      setIsPaused(true);
      // setIsRecording(false);
      getAudioBlobAndUrl(); //Give URL back to caller on pause

      //Give blob to the caller side even on pause!
      const finalBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      if (onAudioUpdate) onAudioUpdate(audioUrl!);
      if (onRecordingStop) onRecordingStop(finalBlob);
    }
  };

  const resumeRecording = () => {
    if (recorder && isRecording && isPaused) {
      recorder.resume();
      setIsPaused(false);
      // console.log("Felvétel folytatva.");
    }
  };

  const stopRecording = () => {
    const currentRecorder = recorder;
    const currentStream = stream;
    const currentAudioUrl = audioUrl;

    if (currentRecorder && (isRecording || isPaused)) {
      // Állítsuk le a MediaRecorder-t. Ezzel kibocsátja az utolsó ondataavailable-t, majd az onstop-ot.
      currentRecorder.stop();

      // Frissítjük a legfontosabb állapotot, hogy a gombok letiltódjanak
      setIsRecording(false);
      setIsPaused(false);

      // Felszabadítjuk a memóriát, ami a lejátszáshoz kellett
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        setAudioUrl(null);
      }
      stopTranscribe();
      // console.log("Felvétel leállítási kérése elküldve.");
    }
  };

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
        <div id="waveform" ref={waveformRef} />
        {/* Recording buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
          <IconButton
            onClick={() => {
              if (!isRecording) {
                startRecording();
              } else {
                if (isPaused) {
                  resumeRecording();
                } else {
                  pauseRecording();
                }
              }
            }}
            size="medium"
            sx={{ boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', }}
          >
            {isRecording ? (
              isPaused ? (
                <>
                  <SettingsVoice />
                </>
              ) : (
                <>
                  <Pause />
                </>
              )
            ) : (
              <>
                <Mic />
              </>
            )}
          </IconButton>

          {isRecording && (
            <>
              <IconButton
                onClick={() => {
                  stopRecording();
                }}
                size="medium"
                sx={{ boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', }}
              >
                <Stop />
              </IconButton>
            </>
          )}

          {audioUrl && !isRecording && (
            <>
              <IconButton
                onClick={() => {
                  toggleAudioPlay();
                }}
                size="medium"
                sx={{ boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', }}
              >
                {isPlayingAudio ? <Pause /> : <PlayArrow />}
              </IconButton>
            </>
          )}
        </div>
      </Paper>

      {/* TODO  transcript here*/}
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
                }}
              >
                <Typography>{transcript + wsi_transcript}</Typography>

                <Typography align="center" sx={{
                  marginBlock: -2,
                  color: "#ccc",
                }}>{t("transcription")}</Typography>
              </Paper>
            </Box>
          </div>
        </>
      )}
    </div>
  );
}
