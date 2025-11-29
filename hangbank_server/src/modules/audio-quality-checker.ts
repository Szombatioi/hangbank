import { BadRequestException } from '@nestjs/common';
import * as wav from "node-wav";

export const tooQuietThreshold = 0.01;
export const tooLoudThreshold = 0.75;
export const tooNoisyThreshold = 0.1;
export const minimalRms = 0.01;

export interface QualityMeasure{
    rms: number;
    noiseLevel: number;
    tooQuiet: boolean;
    tooLoud: boolean;
    tooNoisy: boolean;
}

export function checkAudioQuality(file: Express.Multer.File): QualityMeasure {
  if (!file) {
    throw new BadRequestException('No file provided!');
  }

  if (!['audio/wav', 'audio/x-wav', 'audio/wave'].includes(file.mimetype)) {
    throw new BadRequestException('File must be a WAV audio file.');
  }

  const decoded = wav.decode(file.buffer);
  const samples: number[][] = decoded.channelData;
  const sampleRate = decoded.sampleRate;

  const flatSamples = samples[0]; //First channel

  //Root Mean Square - RMS (loudness)
  const rms = Math.sqrt(flatSamples.reduce((acc, val) => acc + val * val, 0) / flatSamples.length);

  //Standard Deviation (noise level)
  const mean = flatSamples.reduce((acc, val) => acc + val, 0) / flatSamples.length;
  const variance = flatSamples.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / flatSamples.length;
  const noiseLevel = Math.sqrt(variance);

  const tooQuiet = rms < tooQuietThreshold;
  const tooLoud = rms > tooLoudThreshold;

  //noiseLevel / rms -> normalized noise metric
  //independent of absolute loudness
  const tooNoisy = rms > minimalRms && noiseLevel / rms > tooNoisyThreshold; //We check if RMS not too small to avoid false positives

  console.log("RMS: ", rms);
  console.log("Mean: ", mean);
  console.log("Noise Level: ", noiseLevel);
  console.log("Noise is too...");
  if(tooQuiet) console.log("\tquiet");
  if(tooLoud) console.log("\tloud");
  if(tooNoisy) console.log("\tnoisy");

  return{
    rms: rms,
    noiseLevel: noiseLevel,
    tooQuiet: tooQuiet,
    tooLoud: tooLoud,
    tooNoisy: tooNoisy,
  }
}
