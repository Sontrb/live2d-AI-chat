import OpenAI from "openai";
import AbortController from "abort-controller";
import { contextType } from "../../App";

export default class LLMChatOpenAI {
  private apiKey: string;
  private modelName: string;
  private apiBase: string;
  private client: OpenAI;

  constructor(apiKey: string, modelName: string, apiBase: string) {
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.apiBase = apiBase;
    this.client = new OpenAI({
      apiKey: `${this.apiKey}`,
      baseURL: `${this.apiBase}`,
      dangerouslyAllowBrowser: true,
    });
  }

  async ask(
    context: contextType[]
  ) {
    const data = {
      model: this.modelName,
      messages: context,
      stream: true,
      max_completion_tokens: 1024,
      temperature: 0.75,
    };

    const controller = new AbortController();
    const signal = controller.signal;

    // @ts-ignore
    const stream = await this.client.chat.completions.create(data, {
      signal,
      headers: {
        "x-stainless-retry-count": null,
      },
    });

    const interruptGenerate = ()=>{controller.abort()}

    return { stream, interruptGenerate };
  }
}
