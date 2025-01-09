'use server'

import { generatePrompt } from '@/lib/gemini'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { v4 as uuidv4 } from 'uuid'

export async function generatePromptAction(imageData: string, applicationType: string) {
  try {
    // Convert base64 to file and save temporarily
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Create a temporary file path in system temp directory
    const tempFileName = `${uuidv4()}.png`
    const tempFilePath = join(tmpdir(), tempFileName)

    // Save the file
    await writeFile(tempFilePath, buffer)

    // Generate prompt using Gemini
    const prompt = await generatePrompt(tempFilePath, applicationType)

    // Clean up the temporary file
    await unlink(tempFilePath).catch(console.error)

    return { success: true, prompt }
  } catch (error) {
    console.error('Error generating prompt:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate prompt'
    }
  }
}