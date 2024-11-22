import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, answer } = req.body; // Recebe o tema da pergunta
  if (!question || !answer) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const chatCompletion = await client.chat.completions.create({
        messages: [{ 
            role: 'user', 
            content: `Analise a resposta baseado na pergunta ${question}, depois dê um feedback do que foi bom na resposta e o que poderia ser melhorado. Segue a resposta ${answer}` }],
        model: 'gpt-4o-mini',
      });

    res.status(200).json({
        question: chatCompletion.choices[0].message.content
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
