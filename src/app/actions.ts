'use server'

import { generatePrompt, generateCode } from '@/lib/gemini'

export async function generatePromptAction(base64Image: string, applicationType: string, temperature: number = 0.2) {
  try {
    // Extract base64 data from the data URL
    const base64Data = base64Image.split(',')[1]

    // Generate prompt directly using base64 data
    const stream = await generatePrompt(base64Data, applicationType, temperature)
    return stream

  } catch (error) {
    console.error('Error in generatePromptAction:', error)
    throw error
  }
}

export async function generateCodeAction(base64Image: string, prompt: string, temperature = 0.2) {
  const imageData = base64Image.split(',')[1]
  const stream = await generateCode(imageData, prompt, temperature)
  return stream
}