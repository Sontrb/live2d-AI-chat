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
    this.initStatus = "working";
    const maxStorageBufferBindingSize =
      await this.client.getMaxStorageBufferBindingSize();
    console.log(maxStorageBufferBindingSize);
    let selectedModel = "RedPajama-INCITE-Chat-3B-v1-q4f16_1-1k";
    if (maxStorageBufferBindingSize >= 2147480000) {
      // ~2G
      selectedModel = "Llama-3.2-3B-Instruct-q4f16_1-MLC";
    }
    try {
      await this.client.reload(selectedModel);
      this.initStatus = "done";
    } catch (e) {
      this.initStatus = "error";
      this.initProgress = (e as Error).message;
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
      max_completion_tokens: 1024,
      temperature: 0.75,
    };

    const stream = await this.client.chat.completions.create(data);

    return { stream, interruptGenerate: this.client.interruptGenerate };
  }
}
