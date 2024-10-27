import { getBackendEndpoint } from "../appstore";

export default async function textToSpeech(input: string, model = "tts") {
  const url =  getBackendEndpoint() + "/tts";
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

  return data;
}
