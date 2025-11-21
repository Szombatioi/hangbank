class RecorderProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
    }
  
    process(inputs) {
      const input = inputs[0];
      if (input.length > 0) {
        const channelData = input[0]; // take first channel (mono)
        // Send Float32Array to main thread
        this.port.postMessage(new Float32Array(channelData));
      }
      return true;
    }
  }
  
  registerProcessor("recorder-processor", RecorderProcessor);
  