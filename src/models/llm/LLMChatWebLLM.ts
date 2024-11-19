import { InitProgressReport, MLCEngine } from "@mlc-ai/web-llm";
import { contextType } from "../../App";

export default class LLMChatWebLLM {
  private modelName: string;
  private client: MLCEngine;
  private initStatus: "not start" | "working" | "done" | "error";
  public initProgress: null | string;

  constructor(modelName: string) {
    // Callback function to update model loading progress
    const initProgressCallback = (initProgress: InitProgressReport) => {
      console.log(initProgress);
      this.initProgress = initProgress.text;
    };
    this.initStatus = "not start";
    this.initProgress = null;
    this.client = new MLCEngine({
      initProgressCallback: initProgressCallback,
      logLevel: "DEBUG",
    });
    this.modelName = modelName; // not using
  }

  async init() {
    // This is an asynchronous call and can take a long time to finish
    // models are https://github.com/mlc-ai/web-llm/blob/main/src/config.ts
    this.initStatus = "working";
    try {
      const maxStorageBufferBindingSize =
        await this.client.getMaxStorageBufferBindingSize();
      // alert(maxStorageBufferBindingSize);
      let selectedModel = "SmolLM2-135M-Instruct-q0f32-MLC";
      if (maxStorageBufferBindingSize >= 1073741800) {
        // ~1G
        selectedModel = "Llama-3.2-3B-Instruct-q4f16_1-MLC";
      }
      console.log(`webLLM: select ${selectedModel}`);
      await this.client.reload(selectedModel);
      this.initStatus = "done";
    } catch (e) {
      this.initStatus = "error";
      this.initProgress = (e as Error).message;
      alert("Error: " + (e as Error).message);
    }
  }

  public getInitStatus() {
    return this.initStatus;
  }

  async ask(context: contextType[]) {
    const data = {
      // model: this.modelName,
      messages: context,
      stream: true,
      max_tokens: 200,
      temperature: 0.75,
    };

    const stream = await this.client.chat.completions.create(data);

    return { stream, interruptGenerate: this.client.interruptGenerate };
  }
}
