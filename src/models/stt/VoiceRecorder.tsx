import React, { useState, useEffect, useRef } from "react";

interface VoiceRecorderProps {
  onSpeechRecognized: (transcript: string) => void;
  startSignal: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSpeechRecognized,
  startSignal,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const recognition = useRef(null);
  const [transcript, setTranscript] = useState("");
  const [lastSpeechTime, setLastSpeechTime] = useState(0);

  useEffect(() => {
    const SpeechRecognition =
      window.speechRecognition || window.webkitSpeechRecognition;
    recognition.current = new SpeechRecognition();
  }, []);

  useEffect(() => {
    if (recognition.current) {
      recognition.current.continuous = true;

      recognition.current.onresult = (event) => {
        const interimTranscript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setTranscript(interimTranscript);
        setLastSpeechTime(Date.now());
      };
    }
  }, [recognition]);

  useEffect(() => {
    if (transcript) {
      onSpeechRecognized(transcript);
      setTranscript("");
    }
  }, [transcript, onSpeechRecognized]);

  useEffect(() => {
    if (isActivating && !isRecording) {
      handleStartRecording();
    }
  }, [startSignal]);

  const handleStartRecording = () => {
    if (isRecording) return;
    setIsRecording(true);
    if (recognition.current) {
      recognition.current.start();
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (recognition.current) {
      recognition.current.stop();
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isRecording && Date.now() - lastSpeechTime > 2000) {
        // Check if there's interim transcript (meaning speech detected recently)
        if (!transcript) {
          handleStopRecording();
        } else {
          // Reset timeout if speech is still ongoing
          clearTimeout(timeoutId);
          const newTimeoutId = setTimeout(() => {
            handleStopRecording();
          }, 2000);
        }
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [isRecording, lastSpeechTime, transcript]);

  return (
    <button
      onClick={
        isRecording
          ? () => {
              setIsActivating(false);
              handleStopRecording();
            }
          : () => {
              setIsActivating(true);
              handleStartRecording();
            }
      }
    >
      {isRecording ? "停止录音" : "开始录音"}
    </button>
  );
};

export default VoiceRecorder;
