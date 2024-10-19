import express from "express";
import { textToSpeech } from "./models/textToSpeech.js";

const app = express();
const port = 3000;

app.use(express.json());
import cors from "cors"; // https://expressjs.com/en/resources/middleware/cors.html
app.use(cors());
app.use("/static", express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/tts", async (req, res) => {
  let data = await textToSpeech(req.body.input);
  res.send(`http://127.0.0.1:3000/static/${data}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
