export default class LLMChat {
  constructor(apiKey, modelName, apiBase = "http://localhost:11434/v1") {
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.context = [];
    this.apiBase = apiBase;
  }

  async ask(question) {
    // 将问题添加到上下文
    this.context.push({ role: "user", content: question });

    // 构造请求数据
    const data = {
      model: this.modelName,
      messages: this.context,
    };

    // 发送请求
    const response = await fetch(`${this.apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    // 处理响应
    const result = await response.json();
    const answer = result.choices[0].message.content;

    // 将答案添加到上下文
    this.context.push({ role: "assistant", content: answer });

    return answer;
  }
}
