import {
  CreateMLCEngine,
  InitProgressReport,
  MLCEngine,
  prebuiltAppConfig,
} from "@mlc-ai/web-llm";
import AbortController from "abort-controller";
import { contextType } from "../../App";

export default class LLMChatWebLLM {
  private modelName: string;
  private client: MLCEngine;
  private initStatus: "not start" | "working" | "done";
  public initProgress: InitProgressReport | null;

  constructor(modelName: string) {
    // Callback function to update model loading progress
    const initProgressCallback = (initProgress: InitProgressReport) => {
      console.log(initProgress);
      this.initProgress = initProgress;
    };
    this.initStatus = "not start";
    this.initProgress = null;
    const selectedModel = "Llama-3.2-3B-Instruct-q4f16_1-MLC";
    this.client = new MLCEngine({
      initProgressCallback: initProgressCallback,
    });
    this.modelName = selectedModel;
  }

  async init() {
    // This is an asynchronous call and can take a long time to finish
    this.initStatus = "working";
    await this.client.reload(this.modelName);
    this.initStatus = "done";
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
