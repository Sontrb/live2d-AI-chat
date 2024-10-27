import { useState } from "react";
import DictaphoneWidgetB from "./Dictaphone/DictaphoneWidgetB";
import SpeechRecognition from "react-speech-recognition";

export default function Dictaphones({
  onSpeechRecognized,
  onUserSpeaking,
}: {
  onSpeechRecognized: (transcript: string) => void;
  onUserSpeaking: (transcript: string) => void;
}) {
  const [isActivating, setIsActivating] = useState(false);
  const [debug, setDebug] = useState("");

  const listenContinuously = () =>
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-GB",
    }).catch((e) => {
      console.error(e)
    });
  const listenContinuouslyInChinese = () =>
    SpeechRecognition.startListening({
      continuous: true,
      language: "zh-CN",
    }).catch((e) => {
      console.error(e)
    });
  const listenOnce = () =>
    SpeechRecognition.startListening({ continuous: false }).catch((e) => {
      console.error(e)
    });

  return (
    <div>
      <div>{debug}</div>
      <DictaphoneWidgetB
        onSpeechRecognized={onSpeechRecognized}
        onUserSpeaking={onUserSpeaking}
      />
      <div className="flex gap-6">
        <button onClick={listenOnce}>Listen once</button>
        <button
          onClick={() => {
            setIsActivating(true);
            listenContinuously();
          }}
        >
          Listen continuously
        </button>
        {/* <button onClick={listenContinuouslyInChinese}>
        Listen continuously (Chinese)
      </button> */}
        <button onClick={SpeechRecognition.stopListening}>Stop</button>
        {/* <button onClick={SpeechRecognition.removePolyfill}>
        Remove polyfill
      </button> */}
      </div>
    </div>
  );
}
