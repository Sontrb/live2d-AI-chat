import { useState } from "react";
import DictaphoneWidgetB from "./Dictaphone/DictaphoneWidgetB";
import SpeechRecognition from "react-speech-recognition";

export const listenContinuously = () =>
  SpeechRecognition.startListening({
    continuous: true,
    language: "en-GB",
  }).catch((e) => {
    console.error(e);
  });

export const listenContinuouslyInChinese = () =>
  SpeechRecognition.startListening({
    continuous: true,
    language: "zh-CN",
  }).catch((e) => {
    console.error(e);
  });
export const listenOnce = () =>
  SpeechRecognition.startListening({ continuous: false }).catch((e) => {
    console.error(e);
  });

export const stopListening = () =>
  SpeechRecognition.stopListening().catch((e) => {
    console.error(e);
  });

export default function Dictaphones({
  onSpeechRecognized,
  onUserSpeaking,
}: {
  onSpeechRecognized: (transcript: string) => void;
  onUserSpeaking: (transcript: string) => void;
}) {
  const [isActivating, setIsActivating] = useState(false);

  return (
    <div>
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
        <button onClick={stopListening}>Stop</button>
        {/* <button onClick={SpeechRecognition.removePolyfill}>
        Remove polyfill
      </button> */}
      </div>
    </div>
  );
}
