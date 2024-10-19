import fs from "fs";
import { exec, spawn } from "child_process";
import path from "path";
import os from "os";

const outputDirectory = "./public/sound"; // 指定输出目录
function deleteOldFiles(dir, minutes) {
  const now = Date.now();
  const cutoffTime = now - minutes * 60 * 1000; // 10分钟前的毫秒数

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
function generateMP3(text, outputDir) {
  return new Promise((resolve, reject) => {
    // 执行 edge-tts 命令前，先删除10分钟前的文件
    deleteOldFiles(outputDir, 10);

    // 生成文件名，包含时间戳和随机数
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const filename = `${timestamp}-${randomNum}.mp3`;
    const filePath = path.join(outputDir, filename);

    // 执行 edge-tts 命令
    const edgeTtsProcess = spawn("edge-tts", [
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
        // 检查文件是否存在
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            console.error("Failed to create MP3 file:", err);
            reject(err);
          } else {
            console.log("MP3 file generated successfully:", filePath);
            resolve(filename);
          }
        });
      }
    });
  });
}

export async function textToSpeech(text) {
  // 示例用法
  const data = await generateMP3(text, outputDirectory).catch((error) => {
    console.error("Error:", error);
  });
  return `${outputDirectory.replace('./public','')}/${data}`;
}
