import React, { useState, useRef } from "react";

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fetchQuestion = async () => {
    try {
      const response = await fetch("/api/generateQuestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: "frontend development" }), // Tema pode ser dinâmico
      });

      const data = await response.json();
      setQuestion(data.question);
    } catch (error) {
      console.error("Failed to fetch question:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
  
      mediaRecorder.start();
      setIsRecording(true);
  
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
  
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        console.log("Audio recording stopped", audioBlob);
  
        try {
          // Converter o áudio para Base64
          const audioBase64 = await convertToBase64(audioBlob);
  
          // Fazer a requisição com o áudio em Base64
          const response = await fetch("/api/transcribeChatGpt", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ audioBase64 }),
          });
  
          if (!response.ok) {
            throw new Error("Failed to transcribe audio");
          }
  
          const data = await response.json();
          setTranscription(data.transcription);
        } catch (error) {
          console.error("Error transcribing audio:", error);
        } finally {
          audioChunksRef.current = [];
          setAudioUrl(URL.createObjectURL(audioBlob));
        }
      };
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };
  
  // Função auxiliar para converter Blob em Base64
  const convertToBase64 = (blob: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64String = reader?.result?.split(",")[1]; // Remover prefixo `data:audio/wav;base64,`
        resolve(base64String);
      };
      reader.onerror = reject;
    });
  };
  
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-bold mb-2 text-black">Interview Question</h2>
      {question ? (
        <p className="mb-4 text-gray-700">{question}</p>
      ) : (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={fetchQuestion}
        >
          Generate Question
        </button>
      )}

      <div className="mb-4">
        {isRecording ? (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={stopRecording}
          >
            Stop Recording
          </button>
        ) : (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={startRecording}
          >
            Start Recording
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="mb-4">
          <audio controls src={audioUrl} />
        </div>
      )}

      {transcription && (
        <p className="mt-4 text-gray-700">Transcription: {transcription}</p>
      )}
    </div>
  );
};

export default AudioRecorder;
