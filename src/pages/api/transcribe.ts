import { NextApiRequest, NextApiResponse } from "next";
import speech, { protos } from "@google-cloud/speech";
import fs from "fs";
import path from "path";

const client = new speech.SpeechClient({
  keyFilename: path.join(process.cwd(), "path/to/key.json"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { audio } = req.body;

    const audioBuffer = Buffer.from(audio, "base64");

    const request = {
      audio: {
        content: audioBuffer.toString("base64"),
      },
      config: {
        encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
        sampleRateHertz: 16000,
        languageCode: "en-US",
      },
    };

    try {
      const [response] = await client.recognize(request);
      const transcription = response.results
        ?.map((result) => result.alternatives?.[0].transcript)
        .join("\n");
      res.status(200).json({ transcription });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
