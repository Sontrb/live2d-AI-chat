import "regenerator-runtime/runtime"; // https://github.com/JamesBrill/react-speech-recognition/issues/110#issuecomment-1898624289
import { useEffect, useRef, useState } from "react";
import { Live2DModel, MotionPriority } from "pixi-live2d-display-lipsyncpatch";
import LLMChatOpenAI from "./models/llm/LLMChatOpenAI.ts";
import { addOrChangeSubtitle } from "./models/live2d/functions/subtitle.ts";
import loadModel from "./models/live2d/functions/loadModel";
import autoWink from "./models/live2d/expression/autowink.ts";
import { loadModelTo } from "./models/live2d/functions/loadModelTo.ts";
import {
  useBackendEndpoint,
  useOpenaiApikey,
  useOpenaiEndpoint,
  useOpenaiModelName,
  useUseBackendLLM,
  useUseWebLLM,
} from "./models/appstore.ts";
import Debug from "./components/debug.tsx";
import Dictaphones, {
  listenContinuously,
  listenOnce,
  stopListening,
} from "./models/stt/Dictaphones.tsx";
import Setting from "./components/setting.tsx";
import { useSpeechRecognition } from "react-speech-recognition";
import LLMChatWebLLM from "./models/llm/LLMChatWebLLM.ts";
import { ChatCompletionChunk } from "@mlc-ai/web-llm";
import { textToSpeech } from "./models/tts/textToSpeech.ts";

export type contextType = {
  role: "user" | "assistant" | "system";
  content: string;
};

let userSpeaking = false;
const reader: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stream: any;
  interruptGenerate: () => void;
} = { stream: null, interruptGenerate: () => {} };

function addToContext(
  text: string,
  setContext: (value: React.SetStateAction<contextType[]>) => void
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
  const [chat, setChat] = useState<LLMChatWebLLM | LLMChatOpenAI | null>(null);

  const [backendEndpoint] = useBackendEndpoint();
  const [useBackendLLM] = useUseBackendLLM();
  const [useWebLLM] = useUseWebLLM();
  const [openaiEndpoint] = useOpenaiEndpoint();
  const [openaiApikey] = useOpenaiApikey();
  const [openaiModelName] = useOpenaiModelName();
  const { listening, isMicrophoneAvailable, resetTranscript } =
    useSpeechRecognition();

  // load chat engine
  useEffect(() => {
    setChat(
      useWebLLM
        ? new LLMChatWebLLM("")
        : new LLMChatOpenAI(
            openaiApikey,
            openaiModelName,
            useBackendLLM ? backendEndpoint + "/llm" : openaiEndpoint
          )
    );

    return () => {
      setChat(null);
    };
  }, [
    backendEndpoint,
    openaiApikey,
    openaiEndpoint,
    openaiModelName,
    useBackendLLM,
    useWebLLM,
  ]);

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

  // change subtitle by context
  useEffect(() => {
    return setSubtitle(context[context.length - 1].content);
  }, [context]);

  // set subtitle directly
  useEffect(() => {
    return addOrChangeSubtitle(subtitle);
  }, [subtitle]);

  // after user speak
  async function handleSpeechRecognized(context: contextType[]) {
    userSpeaking = false;
    if (!model || !chat) return;
    const { stream, interruptGenerate } = await chat.ask(context);
    reader.stream = stream;
    reader.interruptGenerate = interruptGenerate;
    setContext((context) => [...context, { role: "assistant", content: "" }]);
    let currentSentence = "";
    for await (const chunk of reader.stream) {
      const llmResponse = chunk.choices[0]?.delta?.content;
      if (userSpeaking) {
        currentSentence = "";
        reader.stream = null;
        break;
      }
      if (!llmResponse) continue;
      currentSentence += llmResponse;
      if (/[.,!?]$/.test(currentSentence)) {
        addToContext(currentSentence, setContext);
        const data = await textToSpeech(currentSentence, "tts");
        await handleSpeak(data, model);
        currentSentence = "";
      }
    }
    if (reader.stream && currentSentence !== "") {
      addToContext(currentSentence, setContext);
      const data = await textToSpeech(currentSentence, "tts");
      await handleSpeak(data, model);
    }
    reader.stream = null;
  }

  // when user speak break the ai speak
  async function handleUserSpeaking(_text: string = "") {
    if (!model) return;
    userSpeaking = true;
    model.stopSpeaking();
    if (reader.stream) {
      addToContext("[break by user]", setContext);
      if (reader.interruptGenerate) reader.interruptGenerate();
      reader.stream = null;
    }
  }

  // ai speak
  async function handleSpeak(audio_link: string, model: Live2DModel) {
    if (model === null || model === undefined) {
      return;
    }

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

  // user click screen
  function handleClickScreen() {
    if (chat instanceof LLMChatWebLLM) {
      if (chat.getInitStatus() === "not start") {
        const answer = confirm(
          "webLLM need to load at every time, first time may need some time to download model(~1.5G). load now?"
        );
        if (answer) {
          const timer = setInterval(() => {
            setSubtitle(chat.initProgress || "webLLM loading");
          }, 1000);
          chat.init().then(() => {
            alert("webLLM loaded");
            clearInterval(timer);
            setSubtitle("");
          });
        }
        return;
      } else if (chat.getInitStatus() === "working") {
        alert("webLLM loading: " + chat.initProgress);
        return;
      }
    }
    if (listening) {
      stopListening();
      setSubtitle("-- stop listening... --");
    } else {
      listenOnce();
      // listenContinuously();
      handleUserSpeaking("");
      setSubtitle("-- start listening... --");
    }
  }

  return (
    <>
      {!isMicrophoneAvailable && <div>❗Microphone not available❗</div>}

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

      {/* Setting */}
      <label>
        <input
          type="checkbox"
          checked={showSetting}
          onChange={(e) => setShowSetting(e.target.checked)}
        />
        ShowSetting
      </label>
      {showSetting && <Setting />}

      {/* Debug */}
      <label>
        <input
          type="checkbox"
          checked={debugMode}
          onChange={(e) => setDebugMode(e.target.checked)}
        />
        Debug
      </label>
      {debugMode && <Debug model={model} handleSpeak={handleSpeak} />}

      {/* Show context log */}
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
