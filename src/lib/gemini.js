import OpenAI from 'openai'
import { getSystemAnalysisPrompt, getSystemCodePrompt } from './prompts'
const openai = new OpenAI({
  apiKey: process.env.VISION_API_KEY,
  baseURL: process.env.VISION_BASE_URL,
})

let openaiCode;
if (!process.env.USE_VISION_MODEL_CODE) {
  openaiCode = new OpenAI({
    apiKey: process.env.CHAT_API_KEY,
    baseURL: process.env.CHAT_BASE_URL,
  })
}else{
  openaiCode = openai;
}

export async function generatePrompt(base64Image, applicationType, temperature = 0.2) {
  const messages = [
    {
      "role": "system",
      "content": getSystemAnalysisPrompt(applicationType)
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
      model: process.env.VISION_MODEL,
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

export async function generateCode(useVisionModel,base64Image, prompt, temperature = 0.2) {
  const messages = [
    {
      "role": "system",
      "content": getSystemCodePrompt()
    },
  ];

  if(process.env.CODE_WITH_IMAGE){
    messages.push({
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": `Please generate this application based on the image and description\n: ${prompt}`,
        },
        {
          "type": "image_url",
          "image_url": {
            "url": `data:image/jpeg;base64,${base64Image}`
          },
        },
      ],
    });
  }else{
    messages.push({
      "role": "user",
      "content": `Please generate this application based on the description\n: ${prompt}`,
    });
  }

  try {
    const stream = await openaiCode.chat.completions.create({
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