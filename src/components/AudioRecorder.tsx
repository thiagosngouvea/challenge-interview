import React, { useState, useRef } from "react";

interface AudioRecorderProps {
  question: string;
  questionGpt: string | null;
  audioUrl: string | null;
  setAudioUrl: (audioUrl: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  question,
  questionGpt,
  audioUrl,
  setAudioUrl,
}: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  // const [question, setQuestion] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
  
        try {
          // Converter o áudio para Base64
          const audioBase64 = await convertToBase64(audioBlob);
          localStorage.setItem(`${question}.audioUrl`, audioBase64 as string);
  
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
          localStorage.setItem(`${question}.transcription`, data.transcription as string);

        } catch (error) {
          console.error("Error transcribing audio:", error);
        } finally {
          audioChunksRef.current = [];
          setAudioUrl(URL.createObjectURL(audioBlob));
          if (questionGpt !== null) {
            localStorage.setItem(`${question}.questionGpt`, questionGpt);
          }
        }
        // Save audio and transcription to local storage
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
        const result = reader.result as string;
        const base64String = result.split(",")[1]; // Remover prefixo `data:audio/wav;base64,`
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
      <div className="">
        {isRecording ? (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={stopRecording}
          >
            Parar a gravação
          </button>
        ) : (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={startRecording}
          >
            {audioUrl ? "Regravar" : "Iniciar a gravação"}
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="my-4">
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
