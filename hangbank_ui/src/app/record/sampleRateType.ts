export const sampleRates = [8000, 16000, 22500, 32000, 44100, 48000] as const;
export type SampleRate = (typeof sampleRates)[number];