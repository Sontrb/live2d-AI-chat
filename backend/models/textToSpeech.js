import fs from "fs";
import { spawn } from "child_process";
import path from "path";
import os from "os";
import { EdgeTTS } from "node-edge-tts";

const tempDir = os.tmpdir();

async function generateMP3_V1(text, outputDir) {
  const outputDirectory = "./public/sound"; // output directory

  function deleteOldFiles(dir, minutes) {
    const now = Date.now();
    const cutoffTime = now - minutes * 60 * 1000;

    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(dir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error("Error getting file stats:", err);
            return;
          }

          if (stats.mtimeMs < cutoffTime) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error("Error deleting file:", err);
              } else {
                console.log("Deleted file:", filePath);
              }
            });
          }
        });
      });
    });
  }

  return new Promise((resolve, reject) => {
    // delete file 10 minutes ago
    deleteOldFiles(outputDir, 10);

    // filename: timestamp-randomNum.mp3
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const filename = `${timestamp}-${randomNum}.mp3`;
    const filePath = path.join(outputDir, filename);

    // run edge-tts process
    const edgeTtsProcess = spawn("edge-tts", [
      "--pitch=+20Hz",
      "--text",
      text,
      "--write-media",
      filePath,
    ]);

    edgeTtsProcess.on("error", (err) => {
      console.error("Error executing edge-tts:", err);
      reject(err);
    });

    edgeTtsProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("edge-tts exited with non-zero code:", code);
        reject(new Error("edge-tts execution failed"));
      } else {
        // check if the file was created
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            console.error("Failed to create MP3 file:", err);
            reject(err);
          } else {
            console.log("MP3 file generated successfully:", filePath);
            resolve(
              `http://127.0.0.1:3000/static/${outputDirectory.replace(
                "./public",
                ""
              )}/${filePath}`
            );
          }
        });
      }
    });
  });
}

async function generateMP3(text) {
  const tts = new EdgeTTS({
    voice: "en-US-AriaNeural",
    lang: "en-US",
    outputFormat: "audio-24khz-96kbitrate-mono-mp3",
    saveSubtitles: true,
    pitch: "+10%",
    rate: "+10%",
    // volume: '-50%'
  });

  const filePath = path.join(tempDir, "temp.mp3");

  await tts.ttsPromise(text, filePath);

  const dataBuffer = fs.readFileSync(filePath);
  const base64String = "data:audio/wav;base64," + dataBuffer.toString("base64");

  return base64String;
}

export async function textToSpeech(text) {
  const data = await generateMP3(text).catch((error) => {
    console.error("Error:", error);
  });
  return data;
}
