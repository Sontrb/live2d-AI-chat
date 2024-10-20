import OpenAI from "openai";

export default class LLMChat {
  private apiKey: string;
  private modelName: string;
  private apiBase: string;
  private answer: string;
  private client: OpenAI;

  constructor(apiKey: string, modelName: string, apiBase: string) {
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.apiBase = apiBase;
    this.answer = "";
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
    };

    const stream = await this.client.chat.completions.create(data, {
      headers: {
        "x-stainless-retry-count": null,
      },
    });

    // const newStream = new ReadableStream<string>({
    //   start: async (controller) => {
    //     this.answer = "";

    //     for await (const chunk of stream) {
    //       const content = chunk.choices[0]?.delta?.content;
    //       this.answer += content;
    //       controller.enqueue(content || undefined);
    //     }
    //   },
    // });

    return stream;
  }
}
