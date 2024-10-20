import config from "../../config";


export default async function (input: string, model = "tts") {
  const url =  config.backend_endpoint + "/tts";
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
