import "regenerator-runtime/runtime"; // https://github.com/JamesBrill/react-speech-recognition/issues/110#issuecomment-1898624289
import { useEffect, useRef, useState } from "react";
import { Live2DModel, MotionPriority } from "pixi-live2d-display-lipsyncpatch";
import textToSpeech from "./models/tts/textToSpeech";
import LLMChat from "./models/llm/LLMChat";
import { addOrChangeSubtitle } from "./models/live2d/functions/subtitle.ts";
import loadModel from "./models/live2d/functions/loadModel";
import autoWink from "./models/live2d/expression/autowink.ts";
import { Stream } from "openai/streaming.mjs";
import { ChatCompletionChunk } from "openai/resources/index.mjs";
import AbortController from "abort-controller";
import { loadModelTo } from "./models/live2d/functions/loadModelTo.ts";
import {
  useBackendEndpoint,
  useOpenaiApikey,
  useOpenaiEndpoint,
  useOpenaiModelName,
  useUseBackendLLM,
} from "./models/appstore.ts";
import Debug from "./components/debug.tsx";
import Dictaphones, {
  listenContinuously,
  stopListening,
} from "./models/stt/Dictaphones.tsx";
import Setting from "./components/setting.tsx";
import { useSpeechRecognition } from "react-speech-recognition";

export type contextType = {
  role: string;
  content: string;
};

let userSpeaking = false;
const reader: {
  stream: Stream<ChatCompletionChunk> | null;
  controller: AbortController | null;
} = { stream: null, controller: null };

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
  const [model, setModel] = useState<Live2DModel | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState<contextType[]>([
    {
      role: "system",
      content:
        "You are a AI for chatting. Your job is to entertain users. let's make some short, funny, and humorous conversation",
    },
  ]);
  const [subtitle, setSubtitle] = useState("");
  const [debugMode, setDebugMode] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const [showContext, setShowContext] = useState(false);

  const [backendEndpoint] = useBackendEndpoint();
  const [useBackendLLM] = useUseBackendLLM();
  const [openaiEndpoint] = useOpenaiEndpoint();
  const [openaiApikey] = useOpenaiApikey();
  const [openaiModelName] = useOpenaiModelName();
  const { listening, isMicrophoneAvailable, resetTranscript } =
    useSpeechRecognition();

  const chat = new LLMChat(
    openaiApikey,
    openaiModelName,
    useBackendLLM ? backendEndpoint + "/llm" : openaiEndpoint
  );

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

  // auto wink
  useEffect(() => {
    if (!model) return;
    return autoWink(model);
  }, [model]);

  // init expression
  useEffect(() => {
    if (!model) return;
    // model.expression('翅膀');
    setSubtitle("-- touch anywhere to start --");
  }, [model]);

  useEffect(() => {
    return setSubtitle(context[context.length - 1].content);
  }, [context]);

  useEffect(() => {
    return addOrChangeSubtitle(subtitle);
  }, [subtitle]);

  // after user speak
  async function handleSpeechRecognized(
    context: {
      role: string;
      content: string;
    }[]
  ) {
    console.log("handleSpeechRecognized", context);
    userSpeaking = false;
    if (!model) return;
    const { stream, controller } = await chat.ask(context);
    reader.stream = stream;
    reader.controller = controller;
    setContext((context) => [...context, { role: "assistant", content: "" }]);
    let currentSentence = "";
    for await (const chunk of reader.stream) {
      const llmResponse = chunk.choices[0]?.delta?.content;
      if (userSpeaking) {
        currentSentence = "";
        reader.stream = null;
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
    if (reader.stream && currentSentence !== "") {
      addToContext(currentSentence, setContext);
      const data = await textToSpeech(currentSentence, "tts");
      const url = await data.text();
      await handleSpeak(url, model);
    }
    reader.stream = null;
  }

  // when user speak break the ai speak
  async function handleUserSpeaking(_text: string) {
    if (!model) return;
    userSpeaking = true;
    model.stopSpeaking();
    if (reader.stream) {
      addToContext("[break by user]", setContext);
      if (reader.controller) reader.controller.abort();
      reader.stream = null;
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
    const expression = undefined; // 模型表情 [可选参数，可以为null或空] [index | expression表情名称]
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
        console.log("model start speak");
        model
          .motion("Speak", undefined, MotionPriority.FORCE)
          .catch((e) => console.error(e));
        model.speak(audio_link, {
          volume: volume,
          expression: expression,
          resetExpression: resetExpression,
          crossOrigin: crossOrigin,
          onFinish: () => {
            console.log("model stop speak");
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
    }).catch((e) => console.error("speakWithPromise error: ", e));

    // model.speak(audio_link);
    // model.speak(audio_link, { volume: volume });
    // model.speak(audio_link, {
    //   expression: expression,
    //   resetExpression: resetExpression,
    // });
  }

  function handleClickScreen() {
    if (listening) {
      stopListening();
      setSubtitle("-- stop listening... --");
    } else {
      listenContinuously();
      setSubtitle("-- start listening... --");
    }
  }

  return (
    <>
      <div
        onClick={() => {
          handleClickScreen();
        }}
        className="w-screen h-screen"
        ref={stage}
        id="canvas"
      ></div>

      <Dictaphones
        onSpeechRecognized={(text: string) => {
          setContext((context) => [
            ...context,
            { role: "user", content: text },
          ]);
          handleSpeechRecognized([...context, { role: "user", content: text }]);
        }}
        onUserSpeaking={(text: string) => {
          handleUserSpeaking(text);
        }}
      />

      <label>
        <input
          type="checkbox"
          checked={showSetting}
          onChange={(e) => setShowSetting(e.target.checked)}
        />
        ShowSetting
      </label>
      {showSetting && <Setting />}

      <label>
        <input
          type="checkbox"
          checked={debugMode}
          onChange={(e) => setDebugMode(e.target.checked)}
        />
        Debug
      </label>
      {debugMode && <Debug model={model} handleSpeak={handleSpeak} />}

      <label>
        <input
          type="checkbox"
          checked={showContext}
          onChange={(e) => setShowContext(e.target.checked)}
        />
        Show context log
      </label>
      {showContext && (
        <ul>
          {context.map((e) => {
            return (
              <li key={e.role + e.content}>
                {e.role}: {e.content}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default App;
