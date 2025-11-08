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
import { Box, IconButton, Tooltip } from "@mui/material";
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
  const [audioUrl, setAudioUrl] = useState<string | null>(null); //the recorded audio URL to represent as waveform and to play
  const audioChunksRef = useRef<Blob[]>([]); //to store the recorded audio chunks

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
            console.log("Felvétel sikeresen lezárva. Végleges Blob átadva.");
        } else {
             // Ez a helyzet akkor állhat elő, ha túl gyorsan nyomták meg a stop-ot
            console.warn("Rögzítés leállítva, de nincs rögzített adat.");
        }

        // Állapotok nullázása
        audioChunksRef.current = [];
        setStream(null);
        setRecorder(null);
        // Az isRecording és isPaused már a stopRecording-ban frissült
    };

      //We start the recording here because setXYZ is async and we want to start right away
      newRecorder.start(save_freq_ms);
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

    try {
      await getStreamAndSetupRecorder();
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
        
        console.log("Felvétel leállítási kérése elküldve.");
    }
  };

  return (
    <div>
      <div
        style={{
          justifySelf: "center",
          border: "1px solid red",
          width: "75%",
          overflowX: "auto",
          overflowY: "hidden",
          whiteSpace: "nowrap",
          marginTop: 8,
          marginBottom: 8,
        }}
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
            sx={{ border: "1px solid red" }}
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
                sx={{ border: "1px solid red" }}
              >
                <Stop />
              </IconButton>
            </>
          )}
        </div>
      </div>

      {/* TODO  transcript here*/}
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <Box
          sx={{
            justifySelf: "center",
            border: "1px solid red",
            width: "75%",
            minHeight: 256,
            maxHeight: 512,
          }}
        ></Box>
      </div>
    </div>
  );
}
