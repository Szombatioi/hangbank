"use client";

import { Mic, Pause, PlayArrow, Redo, RestartAlt, SkipNext, SkipPrevious, Stop, Undo, ZoomIn, ZoomOut } from "@mui/icons-material";
import { Box, IconButton, Paper, Slider, Tooltip } from "@mui/material";
import { t } from "i18next";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from 'wavesurfer.js'

export default function RecordPage() {
    const waveformRef = useRef<HTMLDivElement | null>(null);
    const waveSurferRef = useRef<WaveSurfer | null>(null);

    const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
    const toggleAudioPlay = () => {
        setIsPlayingAudio(!isPlayingAudio);
    }

    useEffect(() => {
        const ws = waveSurferRef.current;
        if (!ws) return;

        if (isPlayingAudio) {
            ws.play();
        } else {
            ws.pause();
        }
    }, [isPlayingAudio]);

    const [minPxPerSec, setMinPxPerSec] = useState<number>(15); //1-1000?
    const handleSliderChange = (event: Event, newValue: number) => {
        setMinPxPerSec(newValue);
    };

    useEffect(() => {
        if (waveSurferRef.current) {
            waveSurferRef.current.zoom(minPxPerSec);
        }
    }, [minPxPerSec]);

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
            url: "./sample.mp3",
            fillParent: false,
            minPxPerSec: minPxPerSec,
            autoScroll: true,
            autoCenter: true
        });
        waveSurferRef.current.on('click', () => {
            setIsPlayingAudio(true);
            waveSurferRef!.current!.play()
        });

        console.log(isPlayingAudio)

        return () => {
            waveSurferRef.current?.destroy();
            waveSurferRef.current = null;
        };
    }, []);

    const restartPlay = () => {
        setIsPlayingAudio(false);
        waveSurferRef!.current!.stop();
    }

    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Paper elevation={3} sx={{ width: "85%" }}>
                    {/* Part 1: Corpus block viewer */}
                    <div style={{marginTop: 8, marginBottom: 8}}>
                        <Box sx={{ justifySelf: "center", border: "1px solid red", width: "75%", minHeight: 256, maxHeight: 512 }}>
                            
                        </Box>
                    </div>

                    {/* Part 2: Waveform of audio */}
                    <div style={{ justifySelf: "center", border: "1px solid red", width: "75%", overflowX: "auto", overflowY: "hidden", whiteSpace: "nowrap", marginTop: 8, marginBottom: 8 }}>
                        <div id="waveform" ref={waveformRef} />
                        <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                            <IconButton>
                                <ZoomOut />
                            </IconButton>
                            <Tooltip title={t("restart_recording")}>
                                <IconButton onClick={() => { restartPlay() }} size="medium" sx={{ border: "1px solid red" }}>
                                    <RestartAlt />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("play_recorded_audio")}>
                                <IconButton onClick={() => { toggleAudioPlay() }} size="medium" sx={{ border: "1px solid red" }}>
                                    {isPlayingAudio ? (
                                        <>
                                            <Pause />
                                        </>
                                    ) : (
                                        <>
                                            <PlayArrow />
                                        </>
                                    )}
                                </IconButton>
                            </Tooltip>
                            <IconButton>
                                <ZoomIn />
                            </IconButton>

                        </div>
                    </div>


                    {/* Part 3: Buttons */}
                    <div style={{ justifySelf: "center", display: "flex", alignItems: "center", gap: 4, marginTop: 8, marginBottom: 8 }}>
                        <div>
                            <Tooltip title={t("record_block_again")}>
                                <IconButton size="medium" sx={{ border: "1px solid red" }}>
                                    <Undo />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div>
                            <Tooltip title={t("record_audio")}>
                                <IconButton size="large" sx={{ border: "1px solid red" }}>
                                    <Mic />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div>
                            <Tooltip title={t("record_next_block")}>
                                <IconButton size="medium" sx={{ border: "1px solid red" }}>
                                    <Redo />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Part 4: Transcribe */}
                    <div style={{marginTop: 8, marginBottom: 8}}>
                        <Box sx={{ justifySelf: "center", border: "1px solid red", width: "75%", minHeight: 256, maxHeight: 512 }}>

                        </Box>
                    </div>
                </Paper>
            </Box>
        </>
    );
}