export default async function (input: string, model = "tts") {
  const url = "http://localhost:3000/tts";
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
