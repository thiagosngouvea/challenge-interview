import { Collapse, Panel } from "antd";
import React, { useEffect, useState } from "react";

interface Answer {
  transcription: string;
  audioUrl: string;
  question: string;
  questionFeedback: string | null;
}

const Answers: React.FC = () => {
  const [answers, setAnswers] = useState<Answer[]>([]);

  const fetchQuestion = async (question: string | null, transcription: string | null) => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            question: question,
            answer: transcription
         }), // Tema pode ser dinâmico
      });

      const data = await response.json();
      return data.question;
    } catch (error) {
      console.error("Failed to fetch question:", error);
    }
  };

  useEffect(() => {
    const loadAnswers = async () => {
      const loadedAnswers: Answer[] = [];
      const keys = Object.keys(localStorage);

      // Filtrar e organizar as perguntas no localStorage
      const questionKeys = keys.filter((key) =>
        key.startsWith("Pergunta-")
      );

      // Montar as respostas para cada pergunta
      for (let i = 0; i < 5; i++) {
        const transcriptionKey = `Pergunta-0${i + 1}.transcription`;
        const audioUrlKey = `Pergunta-0${i + 1}.audioUrl`;
        const questionGpt = `Pergunta-0${i + 1}.questionGpt`;

        const transcription = localStorage.getItem(transcriptionKey);
        const audioUrl = localStorage.getItem(audioUrlKey);
        const question = localStorage.getItem(questionGpt);

        let questionFeedback = null;

        if(question && transcription){
            await fetchQuestion(question, transcription).then((data) => {
                questionFeedback = data;
            });
        }

        if (transcription && audioUrl && question) {
          loadedAnswers.push({ transcription, audioUrl, question, questionFeedback });
        }
      }

      setAnswers(loadedAnswers);
    };

    loadAnswers();
  }, []);

  console.log(answers);

  return (
    <div className="m-16">
      {answers.map((answer, index) => (
        <div key={index} className="bg-white p-4 rounded-xl shadow-xl">
          <h3 className="font-medium">{answer.question}</h3>
          <audio className="my-4" controls src={`data:audio/mpeg;base64,${answer.audioUrl}`} />
            
          <Collapse 
            defaultActiveKey={['1']}
            items={[
                { label: 'Transcrição da Resposta', key: '1', children: <p>{answer.transcription}</p> },
                { label: 'Feedback da Resposta', key: '2', children: <p style={{ whiteSpace: "pre-wrap" }}>{answer.questionFeedback}</p> }
            ]}
          >
        </Collapse>
        </div>
      ))}
    </div>
  );
};

export default Answers;
