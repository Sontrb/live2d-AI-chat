import { useState } from "react";
// @ts-ignore
import Dictaphone from "./Dictaphone";

const DictaphoneWidgetB = ({
  onSpeechRecognized,
  onUserSpeaking,
}: {
  onSpeechRecognized: (transcript: string) => void;
  onUserSpeaking: (transcript: string) => void;
}) => {
  const [message, setMessage] = useState("");
  const commands = [
    {
      command: "* is my name",
      callback: (name: string) => setMessage(`Hi ${name}!`),
      matchInterim: true,
    },
    {
      command: "My top sports are * and *",
      callback: (sport1: string, sport2: string) => setMessage(`#1: ${sport1}, #2: ${sport2}`),
    },
    {
      command: "Goodbye",
      callback: () => setMessage("So long!"),
      matchInterim: true,
    },
    {
      command: "Pass the salt (please)",
      callback: () => setMessage("My pleasure"),
    },
  ];

  return (
    <div>
      {/* <h3>Dictaphone state: </h3> */}
      <p>{message}</p>
      <Dictaphone
        commands={commands}
        onSpeechRecognized={onSpeechRecognized}
        onUserSpeaking={onUserSpeaking}
      />
    </div>
  );
};

export default DictaphoneWidgetB;
