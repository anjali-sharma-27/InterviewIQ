import { useCallback, useEffect, useRef, useState } from "react";

const getSpeechRecognition = (): SpeechRecognitionStatic | null => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
};

export const useWebSpeech = (language = "en-US") => {
  const [isSupported, setIsSupported] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setIsSupported(!!getSpeechRecognition());
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setPartialTranscript("");
  }, []);

  const startRecognition = useCallback(
    (onFinalTranscript: (text: string) => void) => {
      const SpeechRecognitionCtor = getSpeechRecognition();
      if (!SpeechRecognitionCtor) {
        setError("Speech recognition is not supported in this browser.");
        return false;
      }

      stopRecognition();
      setError(null);
      setPartialTranscript("");

      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0]?.transcript ?? "";
          if (result.isFinal) {
            finalText += transcript;
          } else {
            interim += transcript;
          }
        }

        if (interim) setPartialTranscript(interim);
        if (finalText.trim()) {
          onFinalTranscript(finalText.trim());
          setPartialTranscript("");
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== "aborted") {
          setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        recognitionRef.current = null;
      };

      recognition.start();
      recognitionRef.current = recognition;
      return true;
    },
    [language, stopRecognition]
  );

  return {
    isSupported,
    partialTranscript,
    error,
    startRecognition,
    stopRecognition,
  };
};
