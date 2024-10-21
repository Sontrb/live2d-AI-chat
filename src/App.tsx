import "regenerator-runtime/runtime"; // https://github.com/JamesBrill/react-speech-recognition/issues/110#issuecomment-1898624289
import { useEffect, useRef, useState } from "react";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch";
import textToSpeech from "./models/tts/textToSpeech";
import LLMChat from "./models/llm/LLMChat";
import Dictaphones from "./models/stt/Dictaphones.tsx";
import loadModelTo from "./models/live2d/functions/loadModelTo";
import loadModel from "./models/live2d/functions/loadModel";
import config from "./config.ts";
import { twoPointMove } from "./models/live2d/motionMaker/shakeBody.ts";

const apiKey = config.openai_apikey;
const modelName = config.openai_model_name;
const apiBase = config.openai_endpoint;

const chat = new LLMChat(apiKey, modelName, apiBase);

let userSpeaking = false;
let reader: object | null = null;

function addToContext(
  text: string,
  setContext: (
    value: React.SetStateAction<
      {
        role: string;
        content: string;
      }[]
    >
  ) => void
) {
  setContext((context) => {
    const lastContent = JSON.parse(JSON.stringify(context[context.length - 1]));
    lastContent.content = lastContent.content + text;
    return [...context.slice(0, context.length - 1), lastContent];
  });
}

function App() {
  const [model, setModel] = useState<Live2DModel>();
  const stage = useRef(null);
  const [context, setContext] = useState<
    Array<{
      role: string;
      content: string;
    }>
  >([]);
  const expressionInput = useRef<HTMLInputElement>(null);

  // load model when init
  useEffect(() => {
    (async () => {
      setModel(await loadModel());
    })();
  }, []);

  // when model loaded, put it to stage
  useEffect(() => {
    if (!model) return;
    return loadModelTo(stage, model);
  }, [model]);

  // after user speak
  async function handleSpeechRecognized(
    context: {
      role: string;
      content: string;
    }[]
  ) {
    userSpeaking = false;
    if (!model) return;
    const stream = await chat.ask(context);
    reader = stream;
    setContext((context) => [...context, { role: "assistant", content: "" }]);
    let currentSentence = "";
    for await (const chunk of reader) {
      const llmResponse = chunk.choices[0]?.delta?.content;
      if (userSpeaking) {
        currentSentence = "";
        reader = null;
        break;
      }
      currentSentence += llmResponse;
      if (/[.,!?]$/.test(currentSentence)) {
        addToContext(currentSentence, setContext);
        const data = await textToSpeech(currentSentence, "tts");
        const url = await data.text();
        await handleSpeak(url, model);
        currentSentence = "";
      }
    }
    if (reader && currentSentence !== "") {
      addToContext(currentSentence, setContext);
      const data = await textToSpeech(currentSentence, "tts");
      const url = await data.text();
      await handleSpeak(url, model);
    }
    reader = null;
  }

  // when user speak break the ai speak
  async function handleUserSpeaking(text: string) {
    if (!model) return;
    userSpeaking = true;
    model.stopSpeaking();
    if (reader) {
      addToContext("[break by user]", setContext);
      reader = null;
    }
  }

  // ai speak
  async function handleSpeak(audio_link: string, model: Live2DModel) {
    if (model === null || model === undefined) {
      return;
    }
    // const audio_link =
    //   "https://cdn.jsdelivr.net/gh/RaSan147/pixi-live2d-display@v1.0.3/playground/test.mp3"; // 音频链接地址 [可选参数，可以为null或空] [相对或完整url路径] [mp3或wav文件]
    const volume = 1; // 声音大小 [可选参数，可以为null或空][0.0-1.0]
    const expression = 4; // 模型表情 [可选参数，可以为null或空] [index | expression表情名称]
    const resetExpression = true; // 是否在动画结束后将表情expression重置为默认值 [可选参数，可以为null或空] [true | false] [default: true]
    const crossOrigin = "anonymous"; // 使用不同来源的音频 [可选] [default: null]

    function speakWithPromise(
      audio_link: string,
      {
        volume,
        expression,
        resetExpression,
        crossOrigin,
      }: {
        volume?: number;
        expression?: string | number | undefined;
        resetExpression?: boolean;
        crossOrigin?: string;
      }
    ) {
      return new Promise<void>((resolve, reject) => {
        model.motion("Speak").catch((e) => console.error(e));
        model.speak(audio_link, {
          volume: volume,
          expression: expression,
          resetExpression: resetExpression,
          crossOrigin: crossOrigin,
          onFinish: () => {
            model.motion("Idle").catch((e) => console.error(e));
            resolve(); // 成功时解析 Promise
          },
          onError: (err) => {
            console.error("Error: ", err);
            reject(err); // 发生错误时拒绝 Promise
          },
        });
      });
    }

    await speakWithPromise(audio_link, {
      volume: volume,
      expression: expression,
      resetExpression: resetExpression,
      crossOrigin: crossOrigin,
    });

    // 或者如果您想保留某些默认设置
    // model.speak(audio_link);
    // model.speak(audio_link, { volume: volume });
    // model.speak(audio_link, {
    //   expression: expression,
    //   resetExpression: resetExpression,
    // });
  }

  return (
    <>
      <div className="w-screen h-screen" ref={stage} id="canvas"></div>
      {model && (
        <div className="flex place-content-between">
          <div id="test buttons" className="w-1/2 flex gap-2 flex-wrap">
            <button
              className="bg-gray-200 rounded-sm"
              onClick={async () => {
                const data = await textToSpeech("hello word", "tts");
                const url = await data.text();
                handleSpeak(url, model);
              }}
            >
              test speaking
            </button>
            <button
              className="bg-gray-200 rounded-sm"
              onClick={async () => {
                model.motion("Idle").catch((e) => console.error(e));
              }}
            >
              run motion-Idle
            </button>
            <button
              className="bg-gray-200 rounded-sm"
              onClick={async () => {
                model.motion("Speak").catch((e) => console.error(e));
              }}
            >
              run motion-Speak
            </button>
            <br />
            <input
              type="text"
              className="bg-gray-200 rounded-sm"
              id="input"
              placeholder="input expression name"
              ref={expressionInput}
            />
            <button
              className="bg-gray-200 rounded-sm"
              onClick={async () => {
                // use the data in input
                if (expressionInput.current) {
                  const expressionName = expressionInput.current.value;
                  model
                    .expression(Number(expressionName))
                    .catch((e) => console.error(e));
                }
              }}
            >
              run expression
            </button>
            <button
              className="bg-gray-200 rounded-sm"
              onClick={async () => {
                // use the data in input
                if (expressionInput.current) {
                  // const expressionName = expressionInput.current.value;
                  const customMotion =
                    model.internalModel.motionManager.createMotion(
                      twoPointMove(),
                      "app",
                      "temp1"
                    );
                  model.internalModel.motionManager._startMotion(customMotion);
                }
              }}
            >
              run CustomMotion
            </button>
          </div>

          <div className="w-1/2">
            <Dictaphones
              onSpeechRecognized={(text: string) => {
                setContext((context) => [
                  ...context,
                  { role: "user", content: text },
                ]);
                handleSpeechRecognized([
                  ...context,
                  { role: "user", content: text },
                ]);
              }}
              onUserSpeaking={(text: string) => {
                handleUserSpeaking(text);
              }}
            />
          </div>
        </div>
      )}

      <ul>
        {context.map((e) => {
          return (
            <li key={e.role + e.content}>
              {e.role}: {e.content}
            </li>
          );
        })}
      </ul>
    </>
  );
}
export default App;
