"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";

export interface TTSProps{
    lang: string; 
    pitch?: number; 
    rate?: number;
    volume?: number;
}

export interface TTSHandle{
    speak: (text: string) => void;
}

const TTSSpeaker = forwardRef<TTSHandle, TTSProps>((props, ref) => {
    const utterance = new SpeechSynthesisUtterance(); //Create and REUSE this utterance (for memory saving purposes and for keeping settings)

    //Cleanup - if the page is reloaded, stop the TTS
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const speak = (text: string) => {
        utterance.text = text;
        utterance.lang = props.lang ?? "hu-HU";
        utterance.pitch = props.pitch ?? 0;
        utterance.rate = props.rate ?? 1
        utterance.volume = props.volume ?? 1

        //TODO make a selection for the given language
        // let availableVoices = speechSynthesis.getVoices();
        // console.log(availableVoices.find((v) => v.lang === "hu-HU"));
        // utterance.voice = availableVoices[2];
        // console.log(utterance.lang);

        speechSynthesis.speak(utterance);
    }

    //The parent objects (pages) can call these functions
    useImperativeHandle(ref, () => ({
        speak: speak
    }));
    
    return (<></>);
});
export default TTSSpeaker;