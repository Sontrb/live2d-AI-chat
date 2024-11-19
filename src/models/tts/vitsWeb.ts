import * as tts from "@diffusionstudio/vits-web";

const TTS_MODEL_NAME = "en_US-hfc_female-medium";

onmessage = async function (event) {
  const stored = await tts.stored();
  if (stored.indexOf(TTS_MODEL_NAME) === -1) {
    await tts.download(TTS_MODEL_NAME, (progress) => {
      console.log(
        `Downloading ${progress.url} - ${Math.round(
          (progress.loaded * 100) / progress.total
        )}%`
      );
    });
  }
  const wav = await tts.predict({
    text: event.data,
    voiceId: TTS_MODEL_NAME,
  });
  postMessage(wav);
};
