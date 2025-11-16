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
import { start } from "repl";
import WaveSurfer from "wavesurfer.js";

interface RecorderProps {
  selectedDeviceId: string | null;
  sampleRate: number;
  save_freq_ms: number;
  useTranscript: boolean;
  onAudioUpdate?: (url: string) => void;
  onRecordingStop: (finalBlob: Blob, transcription?: string) => void;
  onSpacePress?: (blob: Blob) => void;
  onTranscriptUpdate?: (text: string) => void;
  language: string;
}

export default function Recorder({
  selectedDeviceId,
  sampleRate,
  save_freq_ms,
  useTranscript,
  onAudioUpdate,
  onRecordingStop,
  onSpacePress,
  language,
  onTranscriptUpdate,
}: RecorderProps) {
  const { t } = useTranslation("common");

  const [stream, setStream] = useState<MediaStream | null>(null); //represents the microphone
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null); //represents the recording process
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false); //whether we are recording or not
  const [isPaused, setIsPaused] = useState<boolean>(false); //whether we are paused or not
  const isRecordingRef = useRef(isRecording);
  const isPausedRef = useRef(isPaused);
  const [audioUrl, setAudioUrl] = useState<string | null>(null); //the recorded audio URL to represent as waveform and to play
  const audioUrlRef = useRef<string | null>(null);
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
    audioUrlRef.current = audioUrl; // 💡 SZINKRONIZÁLÁS HOZZÁADVA
  }, [isRecording, isPaused, wsi_transcript, audioUrl]);

  useEffect(() => {
    recorderRef.current = recorder;
  }, [recorder]);

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
        if (error.name === 'InvalidStateError') {
          console.warn("SpeechRecognition already started, ignoring redundant call.");
        } else {
          // Más hiba esetén jelezzük
          console.error("SpeechRecognition start error:", error);
        }
      }
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
  const [minPxPerSec, setMinPxPerSec] = useState<number>(100); //1-1000?
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

    waveSurferRef.current.on("finish", () => {
      setIsPlayingAudio(false);
    });

    // console.log(isPlayingAudio);

    return () => {
      waveSurferRef.current?.destroy();
      waveSurferRef.current = null;
    };
  }, []);

  //Update waveform if there is a new audio URL (every 1 sec)
  useEffect(() => {
    console.log("New audio url")
    const ws = waveSurferRef.current;
    if (!ws) return;
    console.log("Ws is not null")
    if (audioUrl) {
      console.log("AudioURL is not null")
      // Töröljük a régi URL-t, mielőtt újat töltünk be
      if (ws.isPlaying()) {
        ws.pause();
        setIsPlayingAudio(false);
      }

      // Betöltjük az újonnan generált Blob URL-t
      console.log("Loading new audio URL");
      ws.load(audioUrl).catch((err) =>
        console.error("WaveSurfer hiba a betöltéskor:", err)
      );
      console.log("Loaded");

      // Nagyon fontos: felszabadítjuk a régi Blob URL-t
      // (Bár a setAudioUrl az új URL-t kapja, a régi már nem kell, ha nem mentjük el)
      // Ezt a cleanup-ban célszerűbb megoldani.
    } else if (!audioUrl) {
      console.log("AudioURL is null")
      ws.empty();
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
          sampleRate: { ideal: sampleRate },
        },
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      const newRecorder = new MediaRecorder(newStream, {
        mimeType: "audio/webm; codecs=opus",
        bitsPerSecond: 512000, //512 kbps
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
          setAudioUrl((prevAudioUrl) => {
            if (prevAudioUrl) {
              URL.revokeObjectURL(prevAudioUrl);
            }
            return newUrl; // Visszaadjuk az új URL-t
          });

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

        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          setAudioUrl(null);
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
      if(transcript.length === 0)
        startTranscribe();
      // if (recorder && stream) {
      //   recorder!.start(save_freq_ms);
      //   setIsPaused(false);
      //   setIsRecording(true);
      // }
    } catch (err) {
      alert(t("no_mic_access"));
      alert(err);
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
      
      setAudioUrl(null);
      // Felszabadítjuk a memóriát, ami a lejátszáshoz kellett
      // if (currentAudioUrl) {
      //   URL.revokeObjectURL(currentAudioUrl);
      // }
      stopTranscribe();
      // console.log("Felvétel leállítási kérése elküldve.");
    }
  };

  //Handle Spacebar press to go to next block
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Csak akkor fusson, ha van "onSpacePress" prop, rögzítünk és nem vagyunk szüneteltetve
      if (
        onSpacePress &&
        event.code === "Space" &&
        isRecordingRef.current &&
        !isPausedRef.current
      ) {
        event.preventDefault(); // Megakadályozza az oldal görgetését
        
        console.log("Spacebar: Blokkváltás. Jelenlegi Blob mentése és nullázása.");

        // 1. Elküldjük az EDDIGI blob-ot a hívó oldalnak (ahogy eddig is)
        if (onSpacePress) {
          onSpacePress(
            new Blob(audioChunksRef.current, {
              type: "audio/webm",
            })
          );
          console.log("Előző blokk Blob-ja elküldve.");
        }

        // 2. 💡 NULLÁZZUK A BLOB-TÁROLÓT (a kérésed szerint)
        // A MediaRecorder tovább fut, és a következő 'ondataavailable' 
        // esemény már ebbe az üres tömbbe fogja helyezni az adatot.
        audioChunksRef.current = [];

        // 3. NULLÁZZUK a vizualizációt és a transzkripciót
        // Felszabadítjuk a régi URL-t a memóriaszivárgás elkerülése érdekében
        // A 'ref'-et használjuk, hogy biztosan a legutóbbi URL-t kapjuk meg
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }
        
        // Ez triggereli a WaveSurfer useEffect-et, ami meghívja a `ws.empty()`-t
        setAudioUrl(null); 
        
        // Transzkripció nullázása az új blokkhoz
        setTranscript("");
        setWsiTranscript("");

      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSpacePress]); // A függőségi tömböt frissítettem [onSpacePress]-re

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
            sx={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)" }}
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
                sx={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)" }}
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
                sx={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)" }}
              >
                {isPlayingAudio ? <Pause /> : <PlayArrow />}
              </IconButton>
            </>
          )}
        </div>
      </Paper>

      {/* Transcript */}
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
