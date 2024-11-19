import { getBackendEndpoint } from "../appstore";

const vitsWebWorker = new Worker(new URL("./vitsWeb.ts", import.meta.url), {
  type: "module", // Specify that the worker is a module
});

export async function textToSpeechWeb(
  input: string,
  model = "tts"
): Promise<string> {
  vitsWebWorker.postMessage(input);
  return await new Promise((resolve, reject) => {
    vitsWebWorker.onmessage = function (event) {
      adjustPitch(event.data, 2).then((adjustWav) => {
        blobToBase64(adjustWav).then((base64) => {
          resolve(base64);
        });
      });
    };
  });
}

export async function textToSpeechUseBackend(input: string, model = "tts") {
  const url = getBackendEndpoint() + "/tts";
  const headers = {
    "Content-Type": "application/json",
  };
  const body = JSON.stringify({
    input,
    model,
  });
  const data = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  return await data.text();
}

function adjustPitch(blob: Blob, pitchShift: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const audioContext = new window.AudioContext();
    const reader = new FileReader();

    reader.onload = function (event: ProgressEvent<FileReader>) {
      // Decode the audio data
      audioContext
        .decodeAudioData(event.target!.result as ArrayBuffer)
        .then((buffer) => {
          // Create an OfflineAudioContext to generate the new audio data
          const offlineContext = new OfflineAudioContext(
            buffer.numberOfChannels, // Number of channels
            buffer.length, // Length of audio data
            buffer.sampleRate // Sample rate
          );

          // Create a source node and connect it to the offline audio context
          const source = offlineContext.createBufferSource();
          source.buffer = buffer;

          // Shift the pitch by changing the playbackRate
          source.playbackRate.value = 2 ** (pitchShift / 12);

          // Connect the source node to the destination of the OfflineAudioContext
          source.connect(offlineContext.destination);

          // Start rendering the audio
          source.start(0);

          // Render the audio and convert it to a new AudioBuffer
          offlineContext
            .startRendering()
            .then((renderedBuffer) => {
              // Convert the rendered AudioBuffer to a Blob format
              const wavData = bufferToWav(renderedBuffer);
              const wavBlob = new Blob([wavData], { type: "audio/wav" });
              resolve(wavBlob);
            })
            .catch((error) => {
              reject(new Error("Audio rendering failed: " + error));
            });
        })
        .catch((error) => {
          reject(new Error("Audio decoding failed: " + error));
        });
    };

    reader.onerror = function (error: ProgressEvent<FileReader>) {
      reject(new Error("File reading failed: " + error));
    };

    // Read the Blob file
    reader.readAsArrayBuffer(blob);
  });
}

// Convert AudioBuffer to WAV format
function bufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.length;
  const bufferLength = samples * numOfChannels * 2; // 16-bit PCM

  const wav = new DataView(new ArrayBuffer(44 + bufferLength));

  // Write WAV header information
  writeString(wav, 0, "RIFF");
  wav.setUint32(4, 36 + bufferLength, true); // File size
  writeString(wav, 8, "WAVE");
  writeString(wav, 12, "fmt "); // fmt chunk
  wav.setUint32(16, 16, true); // fmt chunk size
  wav.setUint16(20, 1, true); // Audio format (1 = PCM)
  wav.setUint16(22, numOfChannels, true);
  wav.setUint32(24, sampleRate, true);
  wav.setUint32(28, sampleRate * numOfChannels * 2, true); // Byte rate
  wav.setUint16(32, numOfChannels * 2, true); // Block align
  wav.setUint16(34, 16, true); // Bits per sample (16-bit)
  writeString(wav, 36, "data");
  wav.setUint32(40, bufferLength, true);

  // Write audio data
  let offset = 44;
  for (let channel = 0; channel < numOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < samples; i++) {
      wav.setInt16(offset, channelData[i] * 32767, true);
      offset += 2;
    }
  }

  return wav.buffer;
}

// Helper function: write a string to DataView
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
