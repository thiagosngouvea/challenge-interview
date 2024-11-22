import React, { useState, useEffect } from "react";
import AudioRecorder from "@/components/AudioRecorder";
import { Steps } from "antd";

const questions = [
  "Pergunta-01",
  "Pergunta-02",
  "Pergunta-03",
  "Pergunta-04",
  "Pergunta-05",
];

const stepDuration = 120; // Duração de 2 minutos (120 segundos) para cada passo

const Interview: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Array(questions.length).fill(stepDuration));
    const [question, setQuestion] = useState<string | null>(null);


  const fetchQuestion = async () => {
    try {
      const response = await fetch("/api/generateQuestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: "Desenvolvimento frontend, react, nextjs, e outros assuntos relevantes" }), // Tema pode ser dinâmico
      });

      const data = await response.json();
      setQuestion(data.question);
    } catch (error) {
      console.error("Failed to fetch question:", error);
    }
  };

    useEffect(() => {
        fetchQuestion();
    }, [current]);

  // Atualiza o contador do passo atual
  useEffect(() => {
    const timer =
      timeLeft[current] > 0 &&
      setInterval(() => {
        setTimeLeft((prev) =>
          prev.map((time, index) => (index === current ? time - 1 : time))
        );
      }, 1000);

    // Quando o contador do passo atual atinge zero, avança para o próximo passo
    if (timeLeft[current] === 0) {
      handleNextStep();
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft, current]);

  const handleNextStep = () => {
    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
    }
  };

  const onChangeStep = (value: number) => {
    setCurrent(value);
  };

  // Formata o tempo no formato MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-8">
      <Steps
        type="navigation"
        size="small"
        current={current}
        onChange={onChangeStep}
        className="site-navigation-steps"
        items={questions.map((question, index) => ({
          title: `Pergunta 0${index + 1}`,
          subTitle: formatTime(timeLeft[index]),
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
        />
      </div>
    </div>
  );
};

export default Interview;
