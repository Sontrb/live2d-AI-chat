import OpenAI from "openai";

export default class LLMChat {
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
    context: {
      role: string;
      content: string;
    }[]
  ) {
    const data = {
      model: this.modelName,
      messages: context,
      stream: true,
      max_completion_tokens: 1024,
      temperature: 0.75,
    };

    const stream = await this.client.chat.completions.create(data, {
      headers: {
        "x-stainless-retry-count": null,
      },
    });

    return stream;
  }
}
