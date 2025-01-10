import OpenAI from 'openai'
import { getSystemAnalysisPrompt, getSystemCodePrompt } from './prompts'
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
})

export async function generatePrompt(base64Image, applicationType, temperature = 0.2) {
  const messages = [
    {
      "role": "system",
      "content": getSystemAnalysisPrompt()
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": `please generate a prompt for a frontend developer to implement an ${applicationType} application based on the image.`,
        },
        {
          "type": "image_url",
          "image_url": {
            "url": `data:image/jpeg;base64,${base64Image}`
          },
        },
      ],
    }
  ];
  try {
    const stream = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: messages,
      temperature: temperature,
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

export async function generateCode(prompt, temperature = 0.2) {
  const messages = [
    {
      "role": "system",
      "content": getSystemCodePrompt()
    },
    {
      "role": "user",
      "content": prompt
    }
  ];

  try {
    const stream = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: messages,
      temperature: temperature,
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}