import React, { useState, useEffect } from "react";
import AudioRecorder from "@/components/AudioRecorder";
import { Steps } from "antd";
import { useRouter } from "next/router";

const questions = ["Pergunta-01", "Pergunta-02", "Pergunta-03", "Pergunta-04", "Pergunta-05"];
const stepDuration = 120; // 2 minutos (120 segundos)

const Interview: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Array(questions.length).fill(stepDuration));
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);


  const router = useRouter();

  // Verificar perguntas respondidas
  const checkCompletedSteps = () => {
    const completed = questions.reduce<number[]>((acc, question, index) => {
      if (localStorage.getItem(`${question}.audioUrl`)) acc.push(index);
      return acc;
    }, []);
    setCompletedSteps(completed);
    setIsInterviewCompleted(completed.length === questions.length);
  };

  // Reiniciar entrevista
  const restartInterview = () => {
    setCurrent(0);
    setTimeLeft(Array(questions.length).fill(stepDuration));
    setCompletedSteps([]);
    setIsInterviewCompleted(false);
    localStorage.clear();
  };

  // Buscar pergunta
  const fetchQuestion = async () => {
    if (current >= questions.length || isInterviewCompleted) return; // Evita chamadas desnecessárias
    try {
      const response = await fetch("/api/generateQuestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "Qualquer tema relacionado a programação" }),
      });
      const data = await response.json();
      setQuestion(data.question);
    } catch (error) {
      console.error("Failed to fetch question:", error);
    }
  };

  useEffect(() => {
    checkCompletedSteps();
    fetchQuestion(); // Só será chamado se o índice for válido
  }, [current]);

  useEffect(() => {
    if (isInterviewCompleted || timeLeft[current] === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) =>
        prev.map((time, index) => (index === current ? time - 1 : time))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, current, isInterviewCompleted]);

  useEffect(() => {
    if (timeLeft[current] === 0 && current < questions.length) {
      handleNextStep();
    }
  }, [timeLeft, current]);

  const handleNextStep = () => {
    if (isInterviewCompleted) return;

    setAudioUrl(null);

    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      setIsInterviewCompleted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 space-y-8">
      {isInterviewCompleted ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-96 text-center m-4">
          <h1 className="text-xl font-semibold">Entrevista Concluída!</h1>
          <p className="text-gray-500 mt-2">Você completou todas as perguntas. Deseja recomeçar?</p>
          <button
            onClick={restartInterview}
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-lg mr-2"
          >
            Recomeçar
          </button>
          <button
            onClick={() => router.push("/answers")}
            className="bg-green-500 text-white px-4 py-2 mt-4 rounded-lg"
          >
            Concluir
          </button>
        </div>
      ) : (
        <>
          <Steps
            type="navigation"
            size="small"
            current={current}
            items={questions.map((question, index) => ({
              title: `Pergunta 0${index + 1}`,
              subTitle: completedSteps.includes(index)
                ? "Concluído"
                : formatTime(timeLeft[index]),
            }))}
          />
          <div className="bg-white p-6 rounded-lg shadow-md w-96 text-center">
            <h1 className="text-xl font-semibold">{question}</h1>
            <p className="text-gray-500 mt-2">
              Você tem {formatTime(timeLeft[current])} minutos para responder.
            </p>
            <AudioRecorder
              question={questions[current]} 
              questionGpt={question} 
              audioUrl={audioUrl}
              setAudioUrl={setAudioUrl}
            />
          </div>
          {!!audioUrl && (
            <button
              onClick={handleNextStep}
              className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-lg"
            >
              {current === questions.length - 1 ? "Finalizar" : "Próxima Pergunta"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Interview;
