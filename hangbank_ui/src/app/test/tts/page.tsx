"use client";
import { Button } from "@mui/material";

export default function TestTTSPage() {
  const speak = () => {
    let utterance = new SpeechSynthesisUtterance();
    utterance.text = "Hello World!";
    utterance.lang = "hu-HU";
    utterance.pitch = 0;
    // utterance.rate = 4
    // utterance.volume = 0.4

    let availableVoices = speechSynthesis.getVoices();
    console.log(availableVoices.find((v) => v.lang === "hu-HU"));
    // utterance.voice = availableVoices[2];

    console.log(utterance.lang);

    speechSynthesis.speak(utterance);
  };

  return (<><Button onClick={() => speak()}>Speak</Button></>);
}
