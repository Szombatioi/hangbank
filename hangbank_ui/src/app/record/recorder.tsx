import {
  ZoomOut,
  RestartAlt,
  Pause,
  PlayArrow,
  ZoomIn,
  Mic,
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

//   const restartPlay = () => {
//     setIsPlayingAudio(false);
//     waveSurferRef!.current!.stop();
//   };

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
          //   console.log(`Blob mentve, méret: ${fullBlob.size} bájt.`);
        }
      };

      newRecorder.start(save_freq_ms); // 2 másodpercenként ment
      setIsRecording(true);
    } catch (error) {
      //   console.error("Hiba a mikrofon elérésében vagy a Stream beállításában:", error);
      //   alert("Nincs mikrofon hozzáférés! Engedélyezd a böngészőben.");
      alert(t("no_mic_access"));
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      if (recorder && stream) {
        recorder.stop();
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
        setIsRecording(false);
        console.log("Felvétel megállítva.");

        const finalBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // 3. 💡 Visszaadjuk a Blob-ot a hívó oldalnak
        onRecordingStop(finalBlob);
      }
    } else {
      if (!recorder) {
        getStreamAndSetupRecorder();
      }
      // Újraindítási logika (ha a recorder már létezik, de leállt)
      else if (recorder.state === "inactive") {
        audioChunksRef.current = []; // Töröljük a korábbi felvételt
        // Itt kell a null check a recorder-re a start hívás előtt!
        recorder.start(save_freq_ms);
        setIsRecording(true);
        console.log("Felvétel újraindítva.");
      }
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
        <div id="waveform" ref={waveformRef} />
        <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
          {/* <IconButton>
            <ZoomOut />
          </IconButton> */}
          {/* <Tooltip title={t("restart_recording")}>
            <IconButton
              onClick={() => {
                restartPlay();
              }}
              size="medium"
              sx={{ border: "1px solid red" }}
            >
              <RestartAlt />
            </IconButton>
          </Tooltip> */}
          <Tooltip title={t("play_recorded_audio")}>
            <IconButton
              onClick={() => {
                handleToggleRecording();
              }}
              size="medium"
              sx={{ border: "1px solid red" }}
            >
              {isRecording ? (
                <>
                  <Pause />
                </>
              ) : (
                <>
                  <Mic />
                </>
              )}
            </IconButton>
          </Tooltip>
          <IconButton>
            <ZoomIn />
          </IconButton>
        </div>
      </div>

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
