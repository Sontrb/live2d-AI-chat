import express from "express";
import { textToSpeech } from "./models/textToSpeech.js";
import proxy from "express-http-proxy";
import cors from "cors"; // https://expressjs.com/en/resources/middleware/cors.html

const app = express();
const port = process.env.PORT || 61234;

app.use(express.json());
var corsOptions = {
  origin: process.env.cors_allowed_origins,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
app.use("/static", express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/tts", async (req, res) => {
  let data = await textToSpeech(req.body.input);
  res.send(`${data}`);
});

app.post(
  "/llm*",
  proxy(process.env.openai_endpoint, {
    filter: function (req, res) {
      return req.method == "POST";
    },
    proxyReqPathResolver: function (req) {
      console.log(`request path: ${req.url}`);

      return `/v1${req.url.replace('/llm','')}`;
    }
  })
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
