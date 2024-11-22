import { Collapse, Spin } from "antd";
import React, { useEffect, useState } from "react";

interface Answer {
    transcription: string;
    audioUrl: string;
    question: string;
    questionFeedback: string | null;
}

const Answers: React.FC = () => {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(false);

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
                 }),
            });

            const data = await response.json();
            return data.question;
        } catch (error) {
            console.error("Failed to fetch question:", error);
        }
    };

    useEffect(() => {
        const loadAnswers = async () => {
            setLoading(true);
            const loadedAnswers: Answer[] = [];

            for (let i = 0; i < 5; i++) {
                const transcriptionKey = `Pergunta-0${i + 1}.transcription`;
                const audioUrlKey = `Pergunta-0${i + 1}.audioUrl`;
                const questionGpt = `Pergunta-0${i + 1}.questionGpt`;
                const feedbackKey = `Pergunta-0${i + 1}.feedback`;

                const transcription = localStorage.getItem(transcriptionKey);
                const audioUrl = localStorage.getItem(audioUrlKey);
                const question = localStorage.getItem(questionGpt);
                let questionFeedback = localStorage.getItem(feedbackKey);

                if (question && transcription && !questionFeedback) {
                    questionFeedback = await fetchQuestion(question, transcription);
                    localStorage.setItem(feedbackKey, questionFeedback || "");
                }

                if (transcription && audioUrl && question) {
                    loadedAnswers.push({ transcription, audioUrl, question, questionFeedback });
                }
            }

            setAnswers(loadedAnswers);
            setLoading(false);
        };

        loadAnswers();
    }, []);

    return (
        <div className="m-16">
            {loading ? (
                <div className="grid justify-center items-center">
                    <Spin size="large" />
                    <p className="m-4">Carregando respostas...</p>
                </div>
            ) : (
                answers.map((answer, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow-xl mb-4">
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
                ))
            )}
        </div>
    );
};

export default Answers;
