import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log('process.e',process.env['OPENAI_API_KEY']);

  const { topic } = req.body; // Recebe o tema da pergunta
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    const chatCompletion = await client.chat.completions.create({
        messages: [{ role: 'user', content: `Gere uma questão de entrevista sobre ${topic}. Eu quero apenas a pergunta, sem mais explicações ou considerações. Essa pergunta vai ser exibida em um painel e vai ser respondida por um candidato. Deve ser em português do brasil` }],
        model: 'gpt-4o-mini',
      });

    res.status(200).json({
        question: chatCompletion.choices[0].message.content
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
