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
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.start();
    setIsRecording(true);

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      audioChunksRef.current = [];
    };
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async () => {
    console.log("Transcribing audio...");
    console.log('audioUrl',audioUrl);
    if (!audioUrl) return;
  
    const audioBlob = await fetch(audioUrl).then((res) => res.blob());
    const audioArrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(audioArrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
  
    const response = await fetch("/api/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio: base64Audio }),
    });
  
    const { transcription } = await response.json();
    setTranscription(transcription);
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

      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={transcribeAudio}
        disabled={!audioUrl}
      >
        Transcribe Audio
      </button>

      {transcription && (
        <p className="mt-4 text-gray-700">Transcription: {transcription}</p>
      )}
    </div>
  );
};

export default AudioRecorder;
