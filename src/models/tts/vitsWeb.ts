import * as tts from "@diffusionstudio/vits-web";

tts.download("en_US-hfc_female-medium", (progress) => {
  console.log(
    `Downloading ${progress.url} - ${Math.round(
      (progress.loaded * 100) / progress.total
    )}%`
  );
});

onmessage = async function (event) {
  const wav = await tts.predict({
    text: event.data,
    voiceId: "en_US-hfc_female-medium",
  });
  postMessage(wav);
};