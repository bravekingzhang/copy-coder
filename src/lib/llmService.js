import OpenAI from 'openai'
import { getSystemAnalysisPrompt, getSystemCodePrompt } from './prompts'
import { HttpsProxyAgent } from 'https-proxy-agent'

const openai = new OpenAI({
  apiKey: process.env.VISION_API_KEY,
  baseURL: process.env.VISION_BASE_URL,
})

console.log(`current vision model: ${process.env.VISION_MODEL}`)

const useVisionModelCode = process.env.USE_VISION_MODEL_CODE === "true"

let openaiCode;
console.log(`shell we use vision model for code: ${useVisionModelCode}`)
if (useVisionModelCode) {
  openaiCode = openai;
  console.log(`use vision model for code: ${process.env.VISION_MODEL}`)
}else{
  openaiCode = new OpenAI({
    apiKey: process.env.CHAT_API_KEY,
    baseURL: process.env.CHAT_BASE_URL,
  })
  console.log(`use isolated code model: ${process.env.CHAT_MODEL}`)
}

if(process.env.HTTPS_PROXY){
  openaiCode.httpAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY)
}

export async function generatePrompt( base64Image, applicationType, temperature = 0.2) {
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

export async function generateCode(codeWithImage=false,base64Image, prompt, temperature = 0.2) {
  const messages = [
    {
      "role": "system",
      "content": getSystemCodePrompt()
    },
  ];

  if(codeWithImage){
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
      model: useVisionModelCode?process.env.VISION_MODEL:process.env.CHAT_MODEL,
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